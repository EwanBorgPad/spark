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
        <Button btnText="Label" size="xs" color="primary" />
        <Button btnText="Label" size="sm" color="primary" />
        <Button btnText="Label" size="md" color="primary" />
        <Button btnText="Label" size="lg" color="primary" />
        <Button btnText="Label" size="xl" color="primary" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button btnText="Label" size="xs" color="secondary" />
        <Button btnText="Label" size="sm" color="secondary" />
        <Button btnText="Label" size="md" color="secondary" />
        <Button btnText="Label" size="lg" color="secondary" />
        <Button btnText="Label" size="xl" color="secondary" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button btnText="Label" size="xs" color="tertiary" />
        <Button btnText="Label" size="sm" color="tertiary" />
        <Button btnText="Label" size="md" color="tertiary" />
        <Button btnText="Label" size="lg" color="tertiary" />
        <Button btnText="Label" size="xl" color="tertiary" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button btnText="Label" size="xs" color="danger" />
        <Button btnText="Label" size="sm" color="danger" />
        <Button btnText="Label" size="md" color="danger" />
        <Button btnText="Label" size="lg" color="danger" />
        <Button btnText="Label" size="xl" color="danger" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button btnText="Label" size="xs" color="plain" />
        <Button btnText="Label" size="sm" color="plain" />
        <Button btnText="Label" size="md" color="plain" />
        <Button btnText="Label" size="lg" color="plain" />
        <Button btnText="Label" size="xl" color="plain" />
      </div>

      {/* Buttons with Icon */}

      <div className="flex flex-wrap items-start gap-3">
        <Button.Icon icon="SvgX" size="xs" color="primary" />
        <Button.Icon icon="SvgX" size="sm" color="primary" />
        <Button.Icon icon="SvgX" size="md" color="primary" />
        <Button.Icon icon="SvgX" size="lg" color="primary" />
        <Button.Icon icon="SvgX" size="xl" color="primary" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button.Icon icon="SvgX" size="xs" color="secondary" />
        <Button.Icon icon="SvgX" size="sm" color="secondary" />
        <Button.Icon icon="SvgX" size="md" color="secondary" />
        <Button.Icon icon="SvgX" size="lg" color="secondary" />
        <Button.Icon icon="SvgX" size="xl" color="secondary" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button.Icon icon="SvgX" size="xs" color="tertiary" />
        <Button.Icon icon="SvgX" size="sm" color="tertiary" />
        <Button.Icon icon="SvgX" size="md" color="tertiary" />
        <Button.Icon icon="SvgX" size="lg" color="tertiary" />
        <Button.Icon icon="SvgX" size="xl" color="tertiary" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button.Icon icon="SvgX" size="xs" color="danger" />
        <Button.Icon icon="SvgX" size="sm" color="danger" />
        <Button.Icon icon="SvgX" size="md" color="danger" />
        <Button.Icon icon="SvgX" size="lg" color="danger" />
        <Button.Icon icon="SvgX" size="xl" color="danger" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Button.Icon icon="SvgX" size="xs" color="plain" />
        <Button.Icon icon="SvgX" size="sm" color="plain" />
        <Button.Icon icon="SvgX" size="md" color="plain" />
        <Button.Icon icon="SvgX" size="lg" color="plain" />
        <Button.Icon icon="SvgX" size="xl" color="plain" />
      </div>
    </div>
  )
}

export default DesignSystem
