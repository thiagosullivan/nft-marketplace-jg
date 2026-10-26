import { Button } from "../ui/button";

interface IProps {
  text: string;
}

function BtnExplore({ text }: IProps) {
  return (
    <Button className="w-35 h-10 rounded-sm text-base font-bold mb-0! cursor-pointer md:block hidden">
      {text}
    </Button>
  );
}

export default BtnExplore;
