import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold text-primary">
          NFT Marketplace
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/"
            className="text-foreground hover:text-primary [&.active]:text-primary"
          >
            Início
          </Link>
          <Link
            to="/cart"
            className="text-foreground hover:text-primary [&.active]:text-primary"
          >
            Carrinho
          </Link>
          <Link
            to="/login"
            className="text-foreground hover:text-primary [&.active]:text-primary"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
