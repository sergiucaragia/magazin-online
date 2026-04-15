import { CatalogClient } from '@/components/store/CatalogClient';
import { HeroClient } from '@/components/store/HeroClient';

export default function HomePage() {
  return (
    <>
      <HeroClient />
      <section id="catalog">
        <CatalogClient />
      </section>
    </>
  );
}
