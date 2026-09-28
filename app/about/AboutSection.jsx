export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-white text-black"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 md:py-40">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-32">
          <div className="min-w-0">
            <h2 className="eg-display text-[clamp(2.25rem,8vw,5rem)]">
              About
              <br />
              Eternal Glory
            </h2>
          </div>
          <div className="min-w-0 md:pt-4">
            <p className="text-lg leading-relaxed sm:text-2xl sm:leading-[1.5]">
              Eternal Glory is a Christian clothing brand created to express faith through
              everyday clothing.
            </p>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-black/70 sm:text-lg">
              We create pieces that carry meaning while remaining simple enough to become part of
              everyday life.
            </p>
            <p className="eg-eyebrow mt-12 text-black/50">Est. 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}