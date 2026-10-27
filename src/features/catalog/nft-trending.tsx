function NftTrending() {
  return (
    <section className="bg-surface-card pt-6">
      <h2 className="uppercase font-bold text-2xl text-accent ml-5 mb-4">
        NFT em destaque
      </h2>
      <h3 className="uppercase font-bold text-[22px] text-foreground ml-5 mb-4 text-center">
        Oferta limitada
      </h3>
      <div className="relative w-full max-w-[310px] aspect-[310/368] overflow-hidden rounded-3xl">
        <img
          src="/nfts/prod-3.webp"
          alt="NFT em destaque"
          className="size-full object-cover"
          width={310}
          height={368}
        />
      </div>
    </section>
  );
}

export default NftTrending;
