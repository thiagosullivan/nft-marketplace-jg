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
    <div className="bg-surface-card rounded-md flex items-center flex-col md:flex-row p-8 md:p-0 max-w-[585px] w-full]">
      <div className="relative w-full max-w-[292px] aspect-[292/250] overflow-hidden rounded-3xl mb-4 md:mb-0">
        <img
          src={promo.image}
          alt="Promo banner"
          className="size-full object-cover"
          width={292}
          height={250}
        />
      </div>
      <div className="text-center md:text-end flex flex-col items-center md:items-end md:pr-7.5 md:pl-2 gap-y-2 md:max-w-[260px]">
        <h3 className="text-lg font-bold text-foreground">{promo.title}</h3>
        <p className="text-sm text-secondary font-normal">{promo.text}</p>
        <BtnExplore text="Explorar →" />
      </div>
    </div>
  );
}
