import Link from "next/link";

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function CustomLink({ href, children, className = "" }: CustomLinkProps) {
  return (
    <Link 
      href={href} 
      className={`font-bold text-purple-600 hover:text-purple-800 transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}