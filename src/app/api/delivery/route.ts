type DirectoryRow = {
  Ref: string;
  Description: string;
  AreaDescription?: string;
  WarehouseStatus?: string;
  DenyToSelect?: string;
};
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const type = params.get("type"),
    query = (params.get("q") || "").trim(),
    city = params.get("city") || "";
  if (
    !["cities", "warehouses"].includes(type || "") ||
    query.length > 100 ||
    (type === "warehouses" &&
      !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(city))
  ) {
    return Response.json(
      { error: "Некорректный запрос доставки" },
      { status: 400 },
    );
  }
  if (type === "cities" && query.length < 2)
    return Response.json({ items: [] });
  try {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: process.env.NOVA_POSHTA_API_KEY || "",
        modelName: "Address",
        calledMethod: type === "cities" ? "getCities" : "getWarehouses",
        methodProperties: {
          FindByString: query,
          Limit: "30",
          Page: "1",
          ...(type === "warehouses" ? { CityRef: city } : {}),
        },
      }),
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(8000)]),
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error();
    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) throw new Error();
    const items = (result.data as DirectoryRow[])
      .filter(
        (row) =>
          row.Ref &&
          row.Description &&
          row.DenyToSelect !== "1" &&
          (!row.WarehouseStatus || row.WarehouseStatus === "Working"),
      )
      .map((row) => ({
        id: row.Ref,
        label: row.Description,
        detail: row.AreaDescription ? row.AreaDescription + " обл." : "",
      }));
    return Response.json({ items });
  } catch {
    return Response.json(
      {
        error:
          "Справочник Новой Почты недоступен. Попробуйте ещё раз или введите адрес вручную.",
      },
      { status: 503 },
    );
  }
}
