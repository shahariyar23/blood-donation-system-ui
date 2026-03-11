import { useState } from "react";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import ToggleIcon from "../../../shared/button/CustomToggle";
import { Icons } from "../../../shared/icons/Icons";
const faqs = [
  {
    question: "Who can donate blood?",
    answer:
      "Anyone aged 18–60, weighing at least 50 kg, and in good health can donate blood. You should not have donated in the last 3 months and must not be suffering from any infectious diseases.",
  },
  {
    question: "How often can I donate blood?",
    answer:
      "You can donate whole blood once every 3 months (90 days). For platelets or plasma the waiting period may be shorter. Always consult a doctor before donating.",
  },
  {
    question: "Is donating blood safe?",
    answer:
      "Yes, donating blood is completely safe. All equipment used is sterile and disposable. The process takes about 10–15 minutes and most donors feel fine immediately after.",
  },
  {
    question: "How do I register as a donor on BloodConnect?",
    answer:
      'Click "Register as Donor", fill in your blood group, location and contact details, then submit. Your profile will be verified within 24 hours.',
  },
  {
    question: "Can I search for a specific blood group?",
    answer:
      "Absolutely. Use the search bar on the homepage to filter donors by blood group, location, and distance. Results update in real-time based on donor availability.",
  },
  {
    question: "What should I do after donating blood?",
    answer:
      "Rest for 10–15 minutes, drink plenty of fluids, eat a light snack, and avoid strenuous activity for 24 hours. You can resume normal activities the following day.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading */}
        <SectionHeading
          title="Frequently Asked Questions"
          description="Everything you need to know about blood donation and using BloodConnect."
          align="center"
          className="mb-10 sm:mb-14"
        />

        {/* Accordion — constrained width */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl border-2 overflow-hidden transition-all duration-200
                  ${isOpen ? "border-red-200" : "border-gray-100"}`}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-red-50 transition-colors duration-200"
                >
                  <span
                    className={`font-semibold text-sm sm:text-base pr-4 leading-snug
    ${isOpen ? "text-primary" : "text-dark"}`}
                  >
                    {faq.question}
                  </span>

                  <ToggleIcon isOpen={isOpen} icon={<Icons.Arrow />} />
                </button>

                {/* Answer */}
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-10 max-w-3xl mx-auto p-6 rounded-xl bg-red-50 border border-red-100 text-center">
          <p className="font-serif font-semibold text-dark text-base mb-1">
            Still have questions?
          </p>
          <p className="text-gray-400 text-xs mb-5">
            Our support team is available 24/7 to help you.
          </p>
          <CustomButton variant="primary" size="md" radius="full">
            Contact Us
          </CustomButton>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default FAQ;
