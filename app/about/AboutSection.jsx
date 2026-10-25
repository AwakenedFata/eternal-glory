export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-[#ffffff] text-[#000000]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 md:py-36">
        <div className="grid gap-10 md:grid-cols-2 md:gap-10 lg:gap-20 xl:gap-28 items-center">
          {/* Left Column: Heading with Helvetica Black Condensed, vertically centered */}
          <div className="min-w-0 text-center md:text-left flex flex-col justify-center eg-reveal">
            <h2 className="eg-display text-[clamp(2.875rem,8.5vw,5.75rem)] text-[#000000] leading-[0.92]">
              ABOUT
              <br />
              ETERNAL{" "}
              <br className="hidden md:block" />
              GLORY
            </h2>
          </div>

          {/* Right Column: Description with Manrope Regular, vertically centered with zero top offset */}
          <div className="min-w-0 flex flex-col justify-center eg-reveal eg-delay-2">
            <p className="text-justify text-base sm:text-lg md:text-xl leading-relaxed text-[#000000] font-normal">
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
