// @ts-nocheck

Moralis.Cloud.beforeConsume("OrderCreated", (event) => {
  return true;
});

Moralis.Cloud.beforeConsume("OrderFilled", (event) => {
  return true;
});

Moralis.Cloud.beforeConsume("OrderCancelled", (event) => {
  return true;
});

Moralis.Cloud.afterSave("OrderCreated", async ({ object }) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", Number(object.get("orderId")));
  if (!(await query.first())) {
    const Orders = Moralis.Object.extend("Orders");
    const orders = new Orders();

    const web3 = Moralis.web3ByChain("0x2a");
    const tokenIn = new web3.eth.Contract(
      Moralis.Web3.abis.erc20,
      object.get("tokenIn")
    );
    const tokenOut = new web3.eth.Contract(
      Moralis.Web3.abis.erc20,
      object.get("tokenOut")
    );

    let tokenInSymbol: string;
    let tokenOutSymbol: string;
    let tokenInDecimals: string;
    let tokenOutDecimals: string;

    try {
      tokenInSymbol = await tokenIn.methods.symbol().call();
      tokenInDecimals = await tokenIn.methods.decimals().call();
      tokenOutSymbol = await tokenOut.methods.symbol().call();
      tokenOutDecimals = await tokenOut.methods.decimals().call();
    } catch {
      tokenInSymbol = "";
      tokenOutSymbol = "";
      tokenInDecimals = null;
      tokenOutDecimals = null;
    }

    await orders.save({
      orderId: Number(object.get("orderId")),
      targetPrice: object.get("targetPrice"),
      amountIn: object.get("amountIn"),
      tokenIn: object.get("tokenIn"),
      tokenInSymbol,
      tokenInDecimals: tokenInDecimals,
      tokenOut: object.get("tokenOut"),
      tokenOutSymbol,
      tokenOutDecimals: tokenOutDecimals,
      user: object.get("user"),
      poolFee: object.get("poolFee"),
      slippage: object.get("slippage"),
      status: "PENDING",
    });
  }
  await object.destroy();
});

Moralis.Cloud.afterSave("OrderFilled", async ({ object }) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", Number(object.get("orderId")));

  const order = await query.first();
  if (order) {
    order.set("status", "FILLED");
    await order.save();
  }
  await object.destroy();
});

Moralis.Cloud.afterSave("OrderCancelled", async ({ object }) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", Number(object.get("orderId")));

  const order = await query.first();
  if (order) {
    order.set("status", "CANCELLED");
    await order.save();
  }
  await object.destroy();
});

Moralis.Cloud.define("getOrders", async ({ params }) => {
  const query = new Moralis.Query("Orders");
  const user = params.userAddr.toLowerCase();
  query.equalTo("user", user);
  query.addDescending("orderId");
  const orders = await query.find();
  return orders;
});
