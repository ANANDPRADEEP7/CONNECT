const Footer = () => {
  return (
    <footer className="bg-background py-20 px-6 border-t border-border/20">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          {/* Left - CTA */}
          <div className="space-y-6">
            <h3
              className="text-2xl sm:text-3xl font-light leading-snug text-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ready to redefine <strong className="font-bold">ride-sharing</strong> with{" "}
              <strong className="font-bold">seamless</strong>,{" "}
              <strong className="font-bold">smart</strong>, and{" "}
              <strong className="font-bold">secure</strong> connections?
            </h3>
            <button className="inline-flex items-center px-8 py-4 rounded-full bg-secondary text-foreground text-xs tracking-[0.25em] uppercase font-semibold hover:bg-accent transition-colors">
              Get in Touch
            </button>
          </div>

          {/* Middle - Contact */}
          <div className="space-y-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Contact Us</p>
              <p className="text-foreground font-semibold">CONNECT Limited</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Head Office</p>
              <p className="text-foreground text-sm leading-relaxed">
                Floor 37<br />One Canada Square<br />London E14 5AA
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Southend</p>
              <p className="text-foreground text-sm leading-relaxed">
                Skyline Plaza<br />Victoria Avenue<br />Southend<br />Essex SS2 6BB
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Phone</p>
              <p className="text-foreground">+91 999-888-77-66</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Email</p>
              <p className="text-foreground">connectinfo@.com</p>
            </div>
          </div>

          {/* Right - Business links */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Business</p>
            <ul className="space-y-3">
              {["About Us", "Careers", "Partners", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-foreground text-sm hover:text-muted-foreground transition-colors">
                    {link.toUpperCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Optinet U.K. Limited registered in England & Wales<br />
            Company number 10482483
          </p>
          <p className="text-xs text-muted-foreground">
            Copyright © Optinet<br className="sm:hidden" /> All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
