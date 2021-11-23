//@ts-ignore
Moralis.Cloud.beforeConsume("OrderCreated", (event) => {
  return true;
});

//@ts-ignore
Moralis.Cloud.beforeConsume("OrderFilled", (event) => {
  return true;
});

//@ts-ignore
Moralis.Cloud.beforeConsume("OrderCancelled", (event) => {
  return true;
});

Moralis.Cloud.beforeSave("OrderCreated", async (request) => {
  const Orders = Moralis.Object.extend("Orders");
  const orders = new Orders();
  await orders.save({
    orderId: request.object.get("orderId"),
    targetPrice: request.object.get("targetPrice"),
    amountIn: request.object.get("amountIn"),
    tokenIn: request.object.get("tokenIn"),
    tokenOut: request.object.get("tokenOut"),
    user: request.object.get("user"),
    poolFee: request.object.get("poolFee"),
    slippage: request.object.get("slippage"),
    status: "PENDING"
  })
});

Moralis.Cloud.beforeSave("OrderFilled", async (request) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", request.object.get("orderId"));

  const order = await query.first();
  if(order){
    order.set("status", "FILLED");
    await order.save();
  }
});

Moralis.Cloud.beforeSave("OrderCancelled", async (request) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", request.object.get("orderId"));

  const order = await query.first();
  if(order){
    order.set("status", "CANCELLED");
    await order.save();
  }
});

Moralis.Cloud.define("getOrders", async (request) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("user", request.params.userAddr);
  const orders = await query.find();
  return orders;
});