export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <span>
          © {new Date().getFullYear()} NFT Marketplace — desafio técnico
        </span>
        <span>Dados simulados</span>
      </div>
    </footer>
  );
}
