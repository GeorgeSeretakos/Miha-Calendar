export default function SocialSection() {
  return (
    <section className="pb-6">
      <div className="flex flex-col items-center gap-4">
        {/* top line */}
        {/*<div className="w-16 h-0.5 bg-black"></div>*/}

        {/* icons */}
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/groups/997770326951786?locale=el_GR"
            className="w-12 h-12 rounded-full flex items-center justify-center"
            aria-label="Facebook"
          >
            <img
              src="/icons/facebook.png"
              alt="Facebook"
              width={40}
              height={40}
            />
          </a>
          <a
            href="https://www.youtube.com/@FFMEDICALWELLNESS"
            className="w-12 h-12 rounded-full flex items-center justify-center"
            aria-label="Youtube"
          >
            <img
              src="/icons/youtube.png"
              alt="LinkedIn"
              width={40}
              height={40}
            />
          </a>
        </div>

        {/* bottom line */}
        {/*<div className="w-16 h-0.5 bg-black"></div>*/}
      </div>
    </section>
  );
}
