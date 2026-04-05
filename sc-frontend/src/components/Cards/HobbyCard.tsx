"use client";

import TextCard from "./TextCard";
import ImageBgCard from "./ImageBgCard";
import ImageSlideCard from "./ImageSlideCard";
import ImageFillCard from "./ImageFillCard";
import type { Hobby } from "@/types/hobby";

export default function HobbyCard(props: Hobby) {
  // 无图片时使用 TextCard
  if (!props.image) {
    return <TextCard {...props} />;
  }

  // 根据图片布局选择对应组件
  switch (props.image.layout) {
    case "background":
      return <ImageBgCard {...props} />;
    case "slide":
      return <ImageSlideCard {...props} />;
    case "fill":
      return <ImageFillCard {...props} />;
    default:
      return <TextCard {...props} />;
  }
}
