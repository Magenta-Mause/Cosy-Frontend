import { useEffect, useState } from "react";

const imageModules = import.meta.glob<string>("../../assets/**/*.{png,webp,gif,ico}", {
  eager: true,
  query: "?url",
  import: "default",
});

const imageUrls = Object.values(imageModules);

const useAssetPreloader = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const imagePromises = imageUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    );

    Promise.all([document.fonts.ready, ...imagePromises]).then(() => setLoaded(true));
  }, []);

  return loaded;
};

export default useAssetPreloader;
