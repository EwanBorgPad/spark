import { Button } from "../components/Button/Button"
import { Icon } from "../components/Icon/Icon"

const DesignSystem = () => {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <hr className="mt-[200px] w-full border-bd-primary"></hr>

      <h2>Icons & Buttons</h2>

      <div className="flex gap-3 text-xl">
        <Icon icon="SvgArrowDown" />
        <Icon icon="SvgArrowRight" />
        <Icon icon="SvgBorgCoin" />
        <Icon icon="SvgChartLine" />
        <Icon icon="SvgChevronDown" />
        <Icon icon="SvgDocument" />
        <Icon icon="SvgLinkedin" />
        <Icon icon="SvgLock" />
        <Icon icon="SvgMedium" />
        <Icon icon="SvgTwitter" />
        <Icon icon="SvgWalletFilled" />
        <Icon icon="SvgWeb" />
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <Button size="xs" color="primary">
          Label
        </Button>
        <Button size="sm" color="primary">
          Label
        </Button>
        <Button size="md" color="primary">
          Label
        </Button>
        <Button size="lg" color="primary">
          Label
        </Button>
        <Button size="xl" color="primary">
          Label
        </Button>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button size="xs" color="secondary">
          Label
        </Button>
        <Button size="sm" color="secondary">
          Label
        </Button>
        <Button size="md" color="secondary">
          Label
        </Button>
        <Button size="lg" color="secondary">
          Label
        </Button>
        <Button size="xl" color="secondary">
          Label
        </Button>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button size="xs" color="tertiary">
          Label
        </Button>
        <Button size="sm" color="tertiary">
          Label
        </Button>
        <Button size="md" color="tertiary">
          Label
        </Button>
        <Button size="lg" color="tertiary">
          Label
        </Button>
        <Button size="xl" color="tertiary">
          Label
        </Button>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button size="xs" color="danger">
          Label
        </Button>
        <Button size="sm" color="danger">
          Label
        </Button>
        <Button size="md" color="danger">
          Label
        </Button>
        <Button size="lg" color="danger">
          Label
        </Button>
        <Button size="xl" color="danger">
          Label
        </Button>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button size="xs" color="plain">
          Label
        </Button>
        <Button size="sm" color="plain">
          Label
        </Button>
        <Button size="md" color="plain">
          Label
        </Button>
        <Button size="lg" color="plain">
          Label
        </Button>
        <Button size="xl" color="plain">
          Label
        </Button>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button size="xs" color="primary">
          Label
        </Button>
        <Button size="sm" color="primary">
          Label
        </Button>
        <Button size="md" color="primary">
          Label
        </Button>
        <Button size="lg" color="primary">
          Label
        </Button>
        <Button size="xl" color="primary">
          Label
        </Button>
      </div>
    </div>
  )
}

export default DesignSystem
