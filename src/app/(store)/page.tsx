import { CatalogClient } from '@/components/store/CatalogClient';
import { T } from '@/components/T';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <T k="heroTitle" />
        </h1>
        <p className="mt-3 text-gray-300 text-lg max-w-xl mx-auto">
          <T k="heroSubtitle" />
        </p>
        <a
          href="#catalog"
          className="inline-block mt-6 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <T k="discoverCollection" />
        </a>
      </section>

      {/* Catalog */}
      <section id="catalog">
        <CatalogClient />
      </section>
    </>
  );
}
