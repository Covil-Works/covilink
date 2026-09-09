import React from 'react';

/**
 * Authentic, pixel-perfect original SVG icons for all standard social media platforms.
 */

export function InstagramIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  const gradientId = React.useId();
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Instagram" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

export function YouTubeIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="YouTube" {...props}>
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function XIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="X" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TwitterBirdIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#1DA1F2" className={className} aria-label="Twitter" {...props}>
      <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0 0 24 4.59z" />
    </svg>
  );
}

export function TikTokIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="TikTok" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#25D366" className={className} aria-label="WhatsApp" {...props}>
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.176.2-.351.226-.653.076-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.2.05-.376-.025-.526-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.51-.678-.52l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.512c0 1.482 1.079 2.912 1.23 3.113.15.2 2.124 3.243 5.145 4.547.719.31 1.28.495 1.718.634.722.23 1.379.197 1.9.12.58-.087 1.78-.727 2.03-1.43.25-.703.25-1.306.175-1.43-.075-.125-.276-.2-.577-.35zm-5.465 7.618a10.01 10.01 0 0 1-5.111-1.397l-.367-.218-3.797.996 1.014-3.7-.24-.382a9.988 9.988 0 0 1-1.534-5.289c0-5.524 4.49-10.014 10.02-10.014a10.003 10.003 0 0 1 7.085 2.934 9.99 9.99 0 0 1 2.929 7.08c0 5.525-4.49 10.015-10.015 10.015zm8.508-18.523A11.934 11.934 0 0 0 12.007 0C5.378 0 .005 5.373.005 12.001a11.96 11.96 0 0 0 1.837 6.368L0 24l5.77-1.513a11.956 11.956 0 0 0 6.237 1.737h.005c6.627 0 12-5.373 12-12 0-3.207-1.249-6.222-3.504-8.467z" />
    </svg>
  );
}

export function LinkedInIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#0A66C2" className={className} aria-label="LinkedIn" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.54a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
    </svg>
  );
}

export function SpotifyIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#1DB954" className={className} aria-label="Spotify" {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.306c-.215.352-.674.464-1.026.248-2.812-1.718-6.353-2.107-10.524-1.155-.401.092-.801-.16-.893-.561-.092-.402.16-.802.562-.894 4.568-1.044 8.489-.607 11.633 1.314.353.216.464.674.248 1.048zm1.464-3.256c-.27.44-.847.578-1.287.308-3.22-1.979-8.127-2.552-11.935-1.396-.496.15-1.025-.133-1.175-.629-.15-.496.133-1.025.629-1.175 4.354-1.321 9.771-.684 13.46 1.583.44.27.578.847.308 1.309zm.126-3.41c-3.86-2.292-10.228-2.504-13.913-1.385-.59.179-1.218-.16-1.397-.75-.179-.59.16-1.218.75-1.397 4.237-1.286 11.272-1.037 15.703 1.593.53.314.704 1.002.39 1.532-.314.53-1.002.704-1.533.39z" />
    </svg>
  );
}

export function GitHubIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="GitHub" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className={className} aria-label="Facebook" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function TwitchIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#9146FF" className={className} aria-label="Twitch" {...props}>
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

export function ThreadsIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Threads" {...props}>
      <path d="M12.186 24h-.007C5.463 24 0 18.59 0 12 0 5.409 5.463 0 12.179 0h.014c6.716 0 12.179 5.409 12.179 12 0 1.768-.396 3.486-1.145 5.043a1.144 1.144 0 0 1-2.072-.973A9.704 9.704 0 0 0 22.086 12c0-5.362-4.44-9.714-9.893-9.714h-.014c-5.453 0-9.893 4.352-9.893 9.714 0 5.363 4.44 9.714 9.893 9.714h.007c2.613 0 5.068-1.026 6.78-2.835a1.143 1.143 0 0 1 1.666 1.564C18.427 22.753 15.438 24 12.186 24zm4.195-9.255c-.218 0-.435-.015-.649-.044a5.952 5.952 0 0 1-4.708-3.232c-.105-.213-.016-.47.2-.574.215-.106.471-.017.576.198a4.809 4.809 0 0 0 3.805 2.612c1.884.258 3.557-.59 4.254-2.164.718-1.62.433-3.64-.73-5.148-1.425-1.848-3.778-2.585-6.143-1.923-2.616.732-4.484 3.094-4.484 5.67 0 3.25 2.502 5.894 5.576 5.894 1.83 0 3.513-.935 4.39-2.441a1.143 1.143 0 1 1 1.966 1.164c-1.229 2.077-3.535 3.363-6.356 3.363-4.335 0-7.862-3.69-7.862-8.18 0-3.565 2.57-6.822 6.177-7.832 3.298-.923 6.565.105 8.528 2.65 1.631 2.115 2.03 4.95 1.022 7.227-1.006 2.274-3.328 3.49-5.918 3.49z" />
    </svg>
  );
}

export function DiscordIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#5865F2" className={className} aria-label="Discord" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function TelegramIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#229ED9" className={className} aria-label="Telegram" {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
    </svg>
  );
}

export function PinterestIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#E60023" className={className} aria-label="Pinterest" {...props}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.62-5.373-11.987-12-11.987z" />
    </svg>
  );
}

export function SnapchatIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#FFFC00" className={className} aria-label="Snapchat" {...props}>
      <path d="M12.003 0C5.748 0 3.09 3.714 3.09 6.84c0 .819.167 1.771.517 2.656.096.242.148.435.04.66-.109.227-.375.342-.647.45-.67.265-1.469.754-1.497 1.634-.019.59.394.992.836 1.258.749.45 1.587.49 2.327.536.216.013.38.169.41.385.08.577.348 2.052 1.488 2.793.818.532 1.778.583 2.709.633.398.021.79.043 1.171.109.112.02.213.064.298.134.423.351.488.948.513 1.177.032.298.058.536.262.721.242.219.605.275 1.08.165.753-.175 1.458-.583 2.195-.583.738 0 1.442.408 2.195.583.475.11.838.054 1.08-.165.204-.185.23-.423.262-.721.025-.229.09-.826.513-1.177.085-.07.186-.114.298-.134.381-.066.773-.088 1.171-.109.931-.05 1.891-.101 2.709-.633 1.14-.741 1.408-2.216 1.488-2.793.03-.216.194-.372.41-.385.74-.046 1.578-.086 2.327-.536.442-.266.855-.668.836-1.258-.028-.88-.827-1.369-1.497-1.634-.272-.108-.538-.223-.647-.45-.108-.225-.056-.418.04-.66.35-.885.517-1.837.517-2.656C20.916 3.714 18.258 0 12.003 0z" />
    </svg>
  );
}

export function BlueskyIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#1185FE" className={className} aria-label="Bluesky" {...props}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 1.037 1.706.354 2.355-.382 3.057-.037 5.253.354 6.702c1.353 5.016 4.606 6.305 7.646 6.098-4.526 1.056-8.528 3.86-5.467 8.358 3.805 5.59 7.828-.909 9.467-4.358 1.639 3.449 5.662 9.948 9.467 4.358 3.061-4.498-.941-7.302-5.467-8.358 3.04.207 6.293-1.082 7.646-6.098.391-1.449.736-3.645 0-4.347-.683-.649-2.212-1.345-4.848.452C16.046 4.747 13.087 8.686 12 10.8z" />
    </svg>
  );
}

export function WebsiteIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#38BDF8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Website"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function DefaultSocialIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Link"
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/**
 * Universal dynamic resolver for original social network SVG icons.
 */
export function SocialIcon({
  platform,
  className = 'w-5 h-5',
  ...props
}: {
  platform: string;
  className?: string;
  [key: string]: any;
}) {
  const p = (platform || '').toLowerCase().trim();
  switch (p) {
    case 'instagram':
    case 'insta':
    case 'ig':
      return <InstagramIcon className={className} {...props} />;
    case 'youtube':
    case 'yt':
      return <YouTubeIcon className={className} {...props} />;
    case 'twitter':
    case 'x':
    case 'x-twitter':
      return <XIcon className={className} {...props} />;
    case 'twitter-bird':
      return <TwitterBirdIcon className={className} {...props} />;
    case 'tiktok':
    case 'tik-tok':
      return <TikTokIcon className={className} {...props} />;
    case 'whatsapp':
    case 'wa':
    case 'zap':
      return <WhatsAppIcon className={className} {...props} />;
    case 'linkedin':
    case 'in':
      return <LinkedInIcon className={className} {...props} />;
    case 'spotify':
    case 'music':
      return <SpotifyIcon className={className} {...props} />;
    case 'github':
    case 'git':
      return <GitHubIcon className={className} {...props} />;
    case 'facebook':
    case 'fb':
      return <FacebookIcon className={className} {...props} />;
    case 'twitch':
      return <TwitchIcon className={className} {...props} />;
    case 'threads':
      return <ThreadsIcon className={className} {...props} />;
    case 'discord':
      return <DiscordIcon className={className} {...props} />;
    case 'telegram':
    case 'tg':
      return <TelegramIcon className={className} {...props} />;
    case 'pinterest':
      return <PinterestIcon className={className} {...props} />;
    case 'snapchat':
    case 'snap':
      return <SnapchatIcon className={className} {...props} />;
    case 'bluesky':
    case 'bsky':
      return <BlueskyIcon className={className} {...props} />;
    case 'website':
    case 'site':
    case 'globe':
      return <WebsiteIcon className={className} {...props} />;
    default:
      return <DefaultSocialIcon className={className} {...props} />;
  }
}
