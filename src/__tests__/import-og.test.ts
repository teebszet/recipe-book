import { extractOpenGraph } from "@/lib/import/og";

function page(head: string): string {
  return `<html><head>${head}</head><body></body></html>`;
}

describe("extractOpenGraph", () => {
  test("extracts all OG tags", () => {
    const html = page(`
      <meta property="og:title" content="Best Cake" />
      <meta property="og:description" content="A wonderful cake recipe." />
      <meta property="og:image" content="https://cdn.example.com/cake.jpg" />
    `);
    const result = extractOpenGraph(html);
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Best Cake");
    expect(result!.description).toBe("A wonderful cake recipe.");
    expect(result!.imageUrl).toBe("https://cdn.example.com/cake.jpg");
  });

  test("falls back to <title> when og:title is absent", () => {
    const html = page(`
      <title>Cookie Recipe | My Blog</title>
      <meta property="og:description" content="Chewy cookies." />
    `);
    const result = extractOpenGraph(html);
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Cookie Recipe | My Blog");
  });

  test("returns null imageUrl when og:image is absent", () => {
    const html = page(`<meta property="og:title" content="Soup" />`);
    const result = extractOpenGraph(html);
    expect(result!.imageUrl).toBeNull();
  });

  test("returns null when no title at all is found", () => {
    const html = page(`<meta property="og:description" content="No title here." />`);
    expect(extractOpenGraph(html)).toBeNull();
  });

  test("trims whitespace from extracted values", () => {
    const html = page(`
      <meta property="og:title" content="  Soup  " />
      <meta property="og:description" content="  Tasty.  " />
    `);
    const result = extractOpenGraph(html);
    expect(result!.title).toBe("Soup");
    expect(result!.description).toBe("Tasty.");
  });

  test("empty description is returned as empty string (not null)", () => {
    const html = page(`<meta property="og:title" content="Soup" />`);
    const result = extractOpenGraph(html);
    expect(result!.description).toBe("");
  });
});
