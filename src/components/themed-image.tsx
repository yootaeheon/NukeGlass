import Image, { type ImageProps } from "next/image";
import type { Photo } from "@/lib/media";

// A picture that has a second version for the dark theme (product pictures on a dark
// ground). Both are in the page; globals.css shows the one for the current theme, and
// the hidden one is lazy, so the browser never downloads it.
export function ThemedImage({
  photo,
  className = "",
  alt,
  ...rest
}: Omit<ImageProps, "src"> & { photo: Photo }) {
  if (!photo.dark) {
    return <Image src={photo.src} alt={alt} className={className} {...rest} />;
  }
  return (
    <>
      <Image
        src={photo.src}
        alt={alt}
        className={`${className} only-light`}
        {...rest}
      />
      <Image
        src={photo.dark}
        alt={alt}
        className={`${className} only-dark`}
        {...rest}
        priority={false}
        loading="lazy"
      />
    </>
  );
}
