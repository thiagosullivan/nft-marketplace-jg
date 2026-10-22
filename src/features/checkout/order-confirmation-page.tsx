type Props = {
  orderId: string;
};

export function OrderConfirmationPage({ orderId }: Props) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">Confirmação de Pedido</h1>
      <p className="mt-2 text-muted-foreground">
        Pedido: {orderId} — em construção (Fase 2.6).
      </p>
    </div>
  );
}
