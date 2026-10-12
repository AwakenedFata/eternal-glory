export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-[#ffffff] text-[#000000]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 md:py-36">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-28 items-start">
          {/* Left Column: Heading with Helvetica Black Condensed */}
          <div className="min-w-0 text-center md:text-left">
            <h2 className="eg-display text-[clamp(2.5rem,8vw,5.5rem)] text-[#000000] leading-[0.92]">
              ABOUT
              <br />
              ETERNAL
              <br />
              GLORY
            </h2>
          </div>

          {/* Right Column: Description with Manrope Regular */}
          <div className="min-w-0 md:pt-4 text-center md:text-left">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#000000] font-normal">
              Eternal Glory is a Christian clothing brand established in 2026, created to bring faith
              into everyday life through simple and meaningful designs that can be worn with purpose,
              expressed with confidence, and become part of the moments that shape our daily lives.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
