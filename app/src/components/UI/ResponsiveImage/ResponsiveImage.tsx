import React from 'react';

function buildFullPathToImage(imagePath: string) {
  return `${process.env.PUBLIC_URL}/images/${imagePath}`;
}

/**
 * Use public folder instead of src/assets to allow dynamic import for 1x/2x files with different extensions
 * @param path Path to image
 * @param className
 * @param width
 * @param height
 * @returns {JSX.Element}
 * @constructor
 */
export function ResponsiveImage({
  path,
  className,
  width = 'auto',
  height = 'auto',
}: {
  path: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  const fullPath = buildFullPathToImage(path);
  return (
    <picture className={className}>
      <source src={`${fullPath}.webp`} srcSet={`${fullPath}@2x.webp 2x`} type="image/webp" />
      <img src={`${fullPath}.png`} srcSet={`${fullPath}@2x.png 2x`} width={width} height={height} alt="" />
    </picture>
  );
}
