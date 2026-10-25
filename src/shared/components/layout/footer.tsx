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

export function Footer() {
  return (
    <footer className="bg-ink mb-6">
      <div className="max-w-300 w-full mx-auto">
        <div className="bg-surface-card px-8 pt-8 pb-4">
          <div className="flex justify-around">
            <div className="px-4 max-w-60 w-full space-y-3">
              <div className="w-18.5 h-18.5 bg-primary flex items-center justify-center rounded-full">
                <span className="text-ink text-2xl font-bold">W</span>
              </div>
              <h5 className="text-base font-bold text-nowrap">
                Segurança da carteira
              </h5>
              <p className="text-sm text-secondary font-normal">
                Proteja sua carteira e colecione arte digital verificada com
                confiança.
              </p>
            </div>
            <div className="bg-primary w-px block" />
            <div className="px-4 max-w-60 w-full space-y-3">
              <div className="w-18.5 h-18.5 bg-primary flex items-center justify-center rounded-full">
                <span className="text-ink text-2xl font-bold">C</span>
              </div>
              <h5 className="text-base font-bold text-nowrap">
                Criadores em destaque
              </h5>
              <p className="text-sm text-secondary font-normal">
                Conheça artistas, estúdios e comunidades que moldam a cultura
                digital na rede.
              </p>
            </div>
            <div className="bg-primary w-px block" />
            <div className="px-4 max-w-60 w-full space-y-3">
              <div className="w-18.5 h-18.5 bg-primary flex items-center justify-center rounded-full">
                <span className="text-ink text-2xl font-bold">D</span>
              </div>
              <h5 className="text-base font-bold text-nowrap">
                Alertas de lançamentos
              </h5>
              <p className="text-sm text-secondary font-normal">
                Receba calendários de cunhagem, novidades de listas de acesso e
                análises do mercado.
              </p>
            </div>
            <div className="bg-primary w-px block" />
            <form className="flex flex-col px-4 max-w-[325px] w-full gap-y-4">
              <h3 className="text-lg/5 text-foreground font-bold">
                Antecipe-se ao próximo lançamento
              </h3>
              <div className="flex rounded-sm overflow-hidden min-h-10">
                <input
                  type="email"
                  className="bg-surface-dark pl-3 text-sm text-secondary w-full"
                  placeholder="digite seu e-mail"
                />
                <button
                  className="w-21.25 px-3 text-lg text-ink font-bold bg-primary cursor-pointer"
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
        <div className="bg-surface-dark w-full flex justify-between items-center p-8 text-foreground">
          <Link to="/" className="text-sm font-bold uppercase ">
            Kurio
          </Link>
          <p className="max-w-55 text-sm font-normal">
            Feito para colecionadores, criadores e cultura
          </p>
          <p className="max-w-55 text-sm font-normal">contato@email.com</p>
          <p className="max-w-55 text-sm font-normal">+55 11 4002 8922</p>
        </div>
        <nav className="mb-6 p-8 bg-surface-card flex justify-between text-foreground">
          <ul className="space-y-2.5">
            <p className="text-lg font-bold">Meu perfil</p>
            {footerData.perfil.map((data, key) => {
              return (
                <li key={key}>
                  <Link
                    to={data.url}
                    className="text-sm font-normal hover:text-primary duration-150"
                  >
                    {data.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="space-y-2.5">
            <p className="text-lg font-bold mb-2.5">Central de ajuda</p>
            {footerData.central.map((data, key) => {
              return (
                <li key={key}>
                  <Link
                    to={data.url}
                    className="text-sm font-normal hover:text-primary duration-150"
                  >
                    {data.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="space-y-2.5">
            <p className="text-lg font-bold mb-2.5">Coleções</p>
            {footerData.colecao.map((data, key) => {
              return (
                <li key={key}>
                  <Link
                    to={data.url}
                    className="text-sm font-normal hover:text-primary duration-150"
                  >
                    {data.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div>
            <p className="text-lg font-bold mb-5">Redes sociais</p>
            <ul className="flex items-center gap-2.5 mb-8">
              <Link
                to="/"
                className="flex items-center justify-center rounded-sm w-7.5 h-7.5 border border-primary"
              >
                <FaFacebookF className="h-4 text-primary" />
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center rounded-sm w-7.5 h-7.5 border border-primary"
              >
                <FaInstagram className="h-4 text-primary" />
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center rounded-sm w-7.5 h-7.5 border border-primary"
              >
                <FaTwitter className="h-4 text-primary" />
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center rounded-sm w-7.5 h-7.5 border border-primary"
              >
                <FaLinkedinIn className="h-4 text-primary" />
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center rounded-sm w-7.5 h-7.5 border border-primary"
              >
                <FaYoutube className="h-4 text-primary" />
              </Link>
            </ul>
            <p className="text-lg font-bold mb-3">Carteiras compatíveis</p>
            <div className="bg-surface-dark py-1.5 px-2.5 border border-primary rounded-sm text-[9px] text-accent font-bold uppercase flex items-center justify-center gap-x-3">
              <p className="">Metamask</p>
              <span>•</span>
              <p className="">Walletconnect</p>
              <span>•</span>
              <p className="">Coinbase</p>
            </div>
          </div>
        </nav>
        <div className="container mx-auto text-center text-sm text-foreground">
          <span>
            © {new Date().getFullYear()} Kurio. Propriedade digital para todos.
          </span>
        </div>
      </div>
    </footer>
  );
}
