export const formatCurrencyAmount = (amount, options = {}) => {
    if (!amount)
        return "0";
    const { customDecimals, withDollarSign, minDecimals, maxDecimals } = options;
    let minimumFractionDigits = 0;
    let maximumFractionDigits = 2;
    if (minDecimals) {
        minimumFractionDigits = minDecimals;
        maximumFractionDigits = Math.max(minDecimals, maximumFractionDigits);
    }
    if (maxDecimals)
        maximumFractionDigits = maxDecimals;
    if (customDecimals) {
        maximumFractionDigits = customDecimals;
        if (!minDecimals)
            minimumFractionDigits = customDecimals;
    }
    const value = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(Number(amount));
    if (!withDollarSign)
        return value.substring(1);
    return value;
};
