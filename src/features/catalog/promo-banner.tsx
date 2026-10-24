import BtnExplore from "@/shared/components/layout/btn-explore";

export type Promo = {
  id: string;
  image: string;
  title: string;
  text: string;
  href: string;
};

export function PromoBanner({ promo }: { promo: Promo }) {
  return (
    <div className="bg-surface-card rounded-md flex items-center max-w-[585px] w-full]">
      <div className="relative w-full max-w-[292px] aspect-[292/250] overflow-hidden rounded-3xl">
        <img
          src={promo.image}
          alt="Promo banner"
          className="size-full object-cover"
        />
      </div>
      <div className="text-end flex flex-col items-end pr-7.5 pl-2 gap-y-2 max-w-[260px]">
        <h3 className="text-lg font-bold text-foreground">{promo.title}</h3>
        <p className="text-sm text-secondary font-normal">{promo.text}</p>
        <BtnExplore text="Explorar →" />
      </div>
    </div>
  );
}
