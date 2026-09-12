import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Nenhum arquivo de imagem foi enviado.' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
    ];

    if (!validMimeTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Apenas imagens (PNG, JPG, WEBP, GIF, SVG, AVIF) são permitidas.' },
        { status: 400 }
      );
    }

    // Limit size to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'A imagem é muito grande. O tamanho máximo permitido é 15MB.' },
        { status: 400 }
      );
    }

    // Clean and sanitize file name
    const rawName = file.name || 'image.png';
    const extension = path.extname(rawName).toLowerCase() || '.png';
    const baseName = path.basename(rawName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'image';

    const timestamp = Date.now();
    const filename = `${baseName}-${timestamp}${extension}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure public/uploads exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const targetFilePath = path.join(uploadsDir, filename);

    await fs.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      message: 'Imagem enviada e salva com sucesso!',
    });
  } catch (error: any) {
    console.error('Error handling image upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar o upload da imagem.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const files = await fs.readdir(uploadsDir);
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'];

    const imageFiles = await Promise.all(
      files
        .filter((file) => validExtensions.includes(path.extname(file).toLowerCase()))
        .map(async (file) => {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            url: `/uploads/${file}`,
            size: stats.size,
            updatedAt: stats.mtimeMs,
          };
        })
    );

    // Sort by most recent first
    imageFiles.sort((a, b) => b.updatedAt - a.updatedAt);

    return NextResponse.json({
      success: true,
      images: imageFiles,
    });
  } catch (error: any) {
    console.error('Error listing images:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao listar imagens salvas.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filenameParam = searchParams.get('filename') || searchParams.get('url');

    if (!filenameParam) {
      return NextResponse.json(
        { error: 'Nome do arquivo ou URL não fornecido.' },
        { status: 400 }
      );
    }

    // Extract basename safely to prevent path traversal
    const cleanBasename = path.basename(filenameParam.replace(/^\/uploads\//, ''));
    if (!cleanBasename || cleanBasename === '.' || cleanBasename === '..') {
      return NextResponse.json(
        { error: 'Nome de arquivo inválido.' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.join(uploadsDir, cleanBasename);

    // Check if file exists
    try {
      await fs.access(targetFilePath);
      await fs.unlink(targetFilePath);
    } catch {
      return NextResponse.json(
        { error: 'Arquivo não encontrado ou já excluído.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Imagem excluída com sucesso.',
      filename: cleanBasename,
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao excluir a imagem.' },
      { status: 500 }
    );
  }
}

