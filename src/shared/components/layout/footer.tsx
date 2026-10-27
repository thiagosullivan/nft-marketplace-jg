import { Link } from "@tanstack/react-router";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const footerData = {
  perfil: [
    { label: "Meu Perfil", url: "/" },
    { label: "Minha coleção", url: "/" },
    { label: "Atividade", url: "/" },
    { label: "Estúdio do criador", url: "/" },
    { label: "Lista de interesse", url: "/" },
  ],
  central: [
    { label: "Central de Ajuda", url: "/" },
    { label: "Como comprar NFTs", url: "/" },
    { label: "Carteira e segurança", url: "/" },
    { label: "Política de mercado", url: "/" },
    { label: "Denunciar item", url: "/" },
  ],
  colecao: [
    { label: "Arte digital", url: "/" },
    { label: "Fotografia", url: "/" },
    { label: "Música", url: "/" },
    { label: "Arte 3D", url: "/" },
    { label: "Utilidade", url: "/" },
  ],
};

const socialLinks = [
  { name: "Facebook", Icon: FaFacebookF },
  { name: "Instagram", Icon: FaInstagram },
  { name: "Twitter", Icon: FaTwitter },
  { name: "LinkedIn", Icon: FaLinkedinIn },
  { name: "YouTube", Icon: FaYoutube },
];

export function Footer() {
  return (
    <footer className="bg-ink mb-6 min-h-[1798px] sm:min-h-[790px] md:min-h-[660px]">
      <div className="max-w-300 w-full mx-auto">
        {/* Bloco superior: 4 colunas com separadores */}
        <div className="bg-surface-card px-4 pt-8 pb-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_minmax(260px,1.2fr)] md:gap-6">
            <div className="space-y-3">
              <div className="w-18.5 h-18.5 bg-primary flex items-center justify-center rounded-full">
                <span className="text-ink text-2xl font-bold">W</span>
              </div>
              <h3 className="text-base font-bold">Segurança da carteira</h3>
              <p className="text-sm text-secondary font-normal">
                Proteja sua carteira e colecione arte digital verificada com
                confiança.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="bg-primary hidden md:block md:w-px md:self-stretch"
            />
            <div
              aria-hidden="true"
              className="bg-primary h-px w-full block md:hidden md:w-px self-stretch"
            />
            <div className="space-y-3">
              <div className="w-18.5 h-18.5 bg-primary flex items-center justify-center rounded-full">
                <span className="text-ink text-2xl font-bold">C</span>
              </div>
              <h3 className="text-base font-bold">Criadores em destaque</h3>
              <p className="text-sm text-secondary font-normal">
                Conheça artistas, estúdios e comunidades que moldam a cultura
                digital na rede.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="bg-primary hidden md:block md:w-px md:self-stretch"
            />
            <div
              aria-hidden="true"
              className="bg-primary h-px w-full block md:hidden md:w-px self-stretch"
            />
            <div className="space-y-3">
              <div className="w-18.5 h-18.5 bg-primary flex items-center justify-center rounded-full">
                <span className="text-ink text-2xl font-bold">D</span>
              </div>
              <h3 className="text-base font-bold">Alertas de lançamentos</h3>
              <p className="text-sm text-secondary font-normal">
                Receba calendários de cunhagem, novidades de listas de acesso e
                análises do mercado.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="bg-primary hidden md:block md:w-px md:self-stretch"
            />
            <div
              aria-hidden="true"
              className="bg-primary h-px w-full block md:hidden md:w-px self-stretch"
            />
            <form className="flex flex-col gap-y-4">
              <h3 className="text-lg/5 text-foreground font-bold">
                Antecipe-se ao próximo lançamento
              </h3>
              <div className="flex rounded-sm overflow-hidden min-h-10">
                <label htmlFor="footer-email" className="sr-only">
                  Digite seu e-mail
                </label>
                <input
                  id="footer-email"
                  type="email"
                  className="bg-surface-dark pl-3 text-sm text-secondary w-full min-w-0"
                  placeholder="digite seu e-mail"
                />
                <button
                  type="submit"
                  className="w-21.25 shrink-0 px-3 text-lg text-ink font-bold bg-primary cursor-pointer disabled:opacity-60"
                  disabled
                >
                  Enviar
                </button>
              </div>
              <p className="text-[13px] font-normal text-secondary">
                Receba lançamentos selecionados, histórias de criadores e
                novidades do mercado.
              </p>
            </form>
          </div>
        </div>

        {/* Bloco da marca */}
        <div className="bg-surface-dark w-full flex flex-col gap-3 p-4 md:flex-row md:justify-between md:items-center md:p-8 text-foreground">
          <Link to="/" className="text-sm font-bold uppercase">
            Kurio
          </Link>
          <p className="max-w-55 text-sm font-normal">
            Feito para colecionadores, criadores e cultura
          </p>
          <p className="max-w-55 text-sm font-normal">contato@email.com</p>
          <p className="max-w-55 text-sm font-normal">+55 11 4002 8922</p>
        </div>

        {/* Bloco de links */}
        <nav
          aria-label="Links do rodapé"
          className="mb-6 p-4 md:p-8 bg-surface-card grid grid-cols-2 gap-6 text-foreground md:flex md:justify-between md:gap-0"
        >
          <ul className="space-y-2.5">
            <li className="text-lg font-bold">Meu perfil</li>
            {footerData.perfil.map((data) => (
              <li key={data.label}>
                <Link
                  to={data.url}
                  className="text-sm font-normal hover:text-primary duration-150"
                >
                  {data.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2.5">
            <li className="text-lg font-bold mb-2.5">Central de ajuda</li>
            {footerData.central.map((data) => (
              <li key={data.label}>
                <Link
                  to={data.url}
                  className="text-sm font-normal hover:text-primary duration-150"
                >
                  {data.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2.5">
            <li className="text-lg font-bold mb-2.5">Coleções</li>
            {footerData.colecao.map((data) => (
              <li key={data.label}>
                <Link
                  to={data.url}
                  className="text-sm font-normal hover:text-primary duration-150"
                >
                  {data.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold mb-5">Redes sociais</p>
            <ul className="flex flex-wrap items-center gap-2.5 mb-8">
              {socialLinks.map(({ name, Icon }) => (
                <li key={name}>
                  <Link
                    to="/"
                    className="flex items-center justify-center rounded-sm w-7.5 h-7.5 border border-primary"
                    aria-label={name}
                    title={name}
                  >
                    <Icon className="h-4 text-primary" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-lg font-bold mb-3">Carteiras compatíveis</p>
            <div className="bg-surface-dark py-1.5 px-2.5 border border-primary rounded-sm text-[9px] text-accent font-bold uppercase flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <p>Metamask</p>
              <span aria-hidden="true">•</span>
              <p>Walletconnect</p>
              <span aria-hidden="true">•</span>
              <p>Coinbase</p>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 text-center text-sm text-foreground">
          <span>
            © {new Date().getFullYear()} Kurio. Propriedade digital para todos.
          </span>
        </div>
      </div>
    </footer>
  );
}
