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

Moralis.Cloud.afterSave("OrderCreated", async (request) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", request.object.get("orderId"));
  if(!await query.first()){
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
    });
  }
  await request.object.destroy();
});

Moralis.Cloud.afterSave("OrderFilled", async (request) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", request.object.get("orderId"));

  const order = await query.first();
  if(order){
    order.set("status", "FILLED");
    await order.save();
  }
  await request.object.destroy();
});

Moralis.Cloud.afterSave("OrderCancelled", async (request) => {
  const query = new Moralis.Query("Orders");
  query.equalTo("orderId", request.object.get("orderId"));

  const order = await query.first();
  if(order){
    order.set("status", "CANCELLED");
    await order.save();
  }
  await request.object.destroy();
});

Moralis.Cloud.define("getOrders", async (request) => {
  const query = new Moralis.Query("Orders");
  const user = request.params.userAddr.toLowerCase()
  query.equalTo("user", user);
  query.addDescending("orderId");
  const orders = await query.find();
  return orders;
});