import heroImage from '@/public/assets/hero.jpg';

export default function HeroSection() {
  return (
    <section id="home" className="scroll-mt-20 bg-white text-black">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-2 md:gap-16 md:py-32 lg:gap-24">
        <div className="min-w-0">
          <p className="eg-eyebrow text-black/50">Eternal Glory</p>
          <h1 className="eg-display mt-6 text-[clamp(3rem,13vw,7.5rem)] text-black">
            Faith
            <br />
            Worn
            <br />
            Daily.
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-black/70 sm:text-lg">
            A Christian clothing brand created to express faith through everyday clothing.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#verify"
              className="inline-flex h-14 items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-85"
            >
              Verify your piece
            </a>
            <a
              href="#shop"
              className="inline-flex h-14 items-center justify-center border border-black px-8 text-xs font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-black hover:text-white"
            >
              Shop Eternal Glory
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <img
            src={heroImage.src}
            alt="Model wearing an Eternal Glory hoodie"
            width={1200}
            height={1504}
            className="h-auto w-full object-cover grayscale"
          />
        </div>
      </div>
    </section>
  );
}
