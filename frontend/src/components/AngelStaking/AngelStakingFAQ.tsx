import Divider from "../Divider"
import Accordion from "../Accordion/Accordion"

const content = [
  {
    question: "How do I invest?",
    answer: [
      "With Angel Staking, you never have to sell your own tokens to invest.",
      "Instead, only the staking rewards generated from your SOL are used to fund early deals on BorgPad. This means you invest in potentially high-reward investments with much less risk.",
    ],
  },
  {
    question: "What wallets can I use?",
    answer: [
      "With Angel Staking, you never have to sell your own tokens to invest.",
      "Instead, only the staking rewards generated from your SOL are used to fund early deals on BorgPad. This means you invest in potentially high-reward investments with much less risk.",
    ],
  },
  {
    question: "Is there a minimum investment amount?",
    answer: [
      "With Angel Staking, you never have to sell your own tokens to invest.",
      "Instead, only the staking rewards generated from your SOL are used to fund early deals on BorgPad. This means you invest in potentially high-reward investments with much less risk.",
    ],
  },
  {
    question: "Are there any fees involved?",
    answer: [
      "With Angel Staking, you never have to sell your own tokens to invest.",
      "Instead, only the staking rewards generated from your SOL are used to fund early deals on BorgPad. This means you invest in potentially high-reward investments with much less risk.",
    ],
  },
  {
    question: "What are the investment options available?",
    answer: [
      "With Angel Staking, you never have to sell your own tokens to invest.",
      "Instead, only the staking rewards generated from your SOL are used to fund early deals on BorgPad. This means you invest in potentially high-reward investments with much less risk.",
    ],
  },
]

const AngelStakingFAQ = () => {
  return (
    <section className="flex w-full flex-col items-center gap-6 px-5 py-16 md:px-16 md:py-28">
      <Divider icon="SvgQuestionCloud" />
      <h2 className="w-full text-center text-[40px] font-semibold leading-[48px]">
        Frequently Asked Questions
      </h2>
      <div className="flex w-full flex-col items-center pb-20">
        {content.map((questionItem, index) => (
          <Accordion
            key={index}
            label={questionItem.question}
            subLabel=""
            className="max-w-[768px] border-b-[1px] border-bd-primary pb-3.5 pt-1"
            questionClassName="border-none bg-transparent justify-between py-4 px-0 text-lg bg-accent font-semibold active:bg-red-400 rounded-none hover:bg-transparent hover:bg-gradient-to-r from-accent via-default to-accent text-left"
            answerClassName="border-none bg-transparent text-base text-fg-secondary font-normal"
            chevronClassName="opacity-100 text-2xl"
          >
            <div className="flex w-full flex-col gap-3 pb-6 pt-2">
              {questionItem.answer.map((paragraph, pIndex) => (
                <p key={pIndex} className="w-full text-fg-tertiary">
                  {paragraph}
                </p>
              ))}
            </div>
          </Accordion>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <span className="w-full text-center text-4xl font-semibold">
          Still have a question?
        </span>
        <p className="text-base font-normal text-fg-secondary">
          Contact us directly at <strong>info@borgpad.com</strong>
        </p>
      </div>
    </section>
  )
}

export default AngelStakingFAQ
