import React from "react";
import { Button } from "../ui/button";

interface IProps {
  text: string;
}

function BtnExplore({ text }: IProps) {
  return (
    <Button className="w-35 h-10 rounded-sm text-base font-bold mb-0!">
      {text}
    </Button>
  );
}

export default BtnExplore;
