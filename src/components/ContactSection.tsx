import { useState, useRef } from "react";
import { Send, Github, Linkedin, ArrowUpRight, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

const EMAIL = "debaprasadpaul208@gmail.com";

const SectionLabel = () => (
  <div className="flex items-center gap-4 mb-12">
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
      04 — Contact
    </span>
    <span className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
  </div>
);

const ContactSection = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setFormState({ name: "", email: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1500);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <section
      id="contact"
      className="relative py-20 md:py-24 bg-white dark:bg-ink-950 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 mesh-gradient opacity-50 mask-fade-bottom" />

      <div className="container mx-auto px-6 md:px-10">
        <SectionLabel />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left — pitch */}
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-heading text-3xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.02]"
            >
              Have an idea worth{" "}
              <span className="font-display italic font-normal text-accent2">
                building
              </span>
              ?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-ink-600 dark:text-ink-400 max-w-xl leading-relaxed"
            >
              I'm open to freelance projects, full-time roles, and the
              occasional weekend collaboration. Drop a note — I read every
              message.
            </motion.p>

            {/* Email card */}
            <motion.button
              onClick={copyEmail}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group mt-10 inline-flex items-center gap-3 px-4 py-3 rounded-full border border-ink-200 dark:border-ink-800 bg-white/40 dark:bg-ink-900/40 backdrop-blur-md font-mono text-sm hover:border-accent2 transition-colors"
            >
              <span className="text-ink-700 dark:text-ink-200">{EMAIL}</span>
              <span className="text-ink-500 dark:text-ink-500 group-hover:text-accent2 transition-colors">
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </span>
            </motion.button>

            {/* Socials */}
            <div className="mt-10 flex items-center gap-3">
              <SocialLink
                href="https://github.com/Debaprasad-dez"
                label="GitHub"
                icon={<Github className="w-4 h-4" />}
              />
              <SocialLink
                href="https://www.linkedin.com/in/debaprasad-paul/"
                label="LinkedIn"
                icon={<Linkedin className="w-4 h-4" />}
              />
              <SocialLink
                href="/myweb/resume.pdf"
                label="Resume"
                icon={<ArrowUpRight className="w-4 h-4" />}
              />
            </div>

            {/* Availability strip */}
            <div className="mt-12 inline-flex items-center gap-3 text-xs font-mono text-ink-500 dark:text-ink-400">
              <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-accent2 status-dot" />
              <span>Currently accepting Q3 2026 engagements</span>
            </div>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/50 p-6 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-6">
                Send a message
              </p>

              <form
                ref={formRef}
                onSubmit={(e) => {
                  // Allow formsubmit.co to handle actual delivery
                  handleSubmit();
                }}
                action="https://formsubmit.co/debaprasadpaul208@gmail.com"
                method="POST"
                className="space-y-4"
              >
                <Field
                  label="Name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                />
                <Field
                  label="Message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  textarea
                />

                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink-950 dark:bg-white text-white dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Sending…</span>
                    </>
                  ) : formSubmitted ? (
                    <span>Message sent ✓</span>
                  ) : (
                    <>
                      <span>Send message</span>
                      <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SocialLink = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-ink-200 dark:border-ink-800 hover:border-accent2 transition-colors"
  >
    <span className="text-ink-700 dark:text-ink-300 group-hover:text-accent2 transition-colors">
      {icon}
    </span>
    <span className="text-xs font-medium text-ink-700 dark:text-ink-300 group-hover:text-accent2 transition-colors">
      {label}
    </span>
  </a>
);

const Field = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  textarea?: boolean;
}) => (
  <label className="block">
    <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-1.5">
      {label}
    </span>
    {textarea ? (
      <textarea
        name={name}
        rows={4}
        value={value}
        onChange={onChange}
        required
        className="w-full resize-none px-3 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-accent2 transition-colors"
        placeholder="Tell me about it…"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-accent2 transition-colors"
        placeholder={label.toLowerCase()}
      />
    )}
  </label>
);

export default ContactSection;
