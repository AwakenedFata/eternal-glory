import heroImage from '@/public/assets/hero.jpg';

export default function HeroSection() {
  return (
    <section id="home" className="scroll-mt-20 bg-[#ffffff] text-[#000000]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-2 md:gap-16 md:py-32 lg:gap-24">
        {/* Left Column: Center aligned on mobile, left aligned on desktop */}
        <div className="min-w-0 flex flex-col items-center text-center md:items-start md:text-left">
          <p className="eg-eyebrow text-[#000000]/60 eg-reveal">OFFICIAL STORE</p>
          <h1 className="eg-display mt-6 text-[clamp(2.875rem,8.5vw,5.75rem)] md:text-[clamp(2.5rem,8vw,5.5rem)] text-[#000000] leading-[0.92] eg-reveal eg-delay-1">
            WEAR
            <br />
            YOUR FAITH
            <br />
            EVERY DAY
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-[#000000]/75 sm:text-lg font-normal eg-reveal eg-delay-2">
            A Christian clothing brand created to express faith through everyday clothing.
          </p>

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:gap-4 md:items-center md:justify-center lg:w-auto lg:flex-row lg:items-start lg:justify-start eg-reveal eg-delay-3">
            <a
              href="#verify"
              className="inline-flex h-14 w-full max-w-[280px] sm:w-[250px] md:w-[260px] lg:w-[235px] shrink-0 whitespace-nowrap items-center justify-center bg-[#000000] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffffff] eg-btn-spring hover:shadow-[0_14px_28px_rgba(0,0,0,0.2)]"
            >
              Verify your piece
            </a>
            <a
              href="#shop"
              className="inline-flex h-14 w-full max-w-[280px] sm:w-[250px] md:w-[260px] lg:w-[235px] shrink-0 whitespace-nowrap items-center justify-center border border-[#000000] bg-[#ffffff] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#000000] eg-btn-spring hover:bg-[#000000] hover:text-[#ffffff] hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)]"
            >
              Shop Eternal Glory
            </a>
          </div>
        </div>

        {/* Right Column: Hero Image with Apple-style smooth parallax-feel hover */}
        <div className="min-w-0 flex justify-center eg-reveal eg-delay-2">
          <div className="overflow-hidden">
            <img
              src={heroImage.src}
              alt="Model wearing an Eternal Glory hoodie"
              width={1200}
              height={1504}
              className="h-auto w-full max-w-lg md:max-w-none object-cover grayscale transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
