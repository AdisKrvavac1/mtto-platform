# ADR 0012: Urednički tok objava, verzije i automatsko povlačenje

Status: prihvaćena (Sprint 6, F2-01)

## Odluka
- Statusi objave: `NACRT → NA_ODOBRENJU → (VRACENO) → ZAKAZANO / OBJAVLJENO → POVUCENO`. Status se mijenja samo radnjama (`POST /admin/posts/:id/workflow`: submit, return, publish, schedule, withdraw, draft); izmjena sadržaja (`PATCH`) ne može mijenjati status.
- Nova uloga **Saradnik (autor)**: piše i šalje na odobrenje, ne objavljuje. Urednik i administrator objavljuju.
- Vraćanje na doradu i povlačenje traže napomenu, koja ide u historiju verzija i dnevnik aktivnosti.
- Objava na odobrenju je zaključana za autora; objavljenu objavu mijenja samo urednik.
- **Pravilo četiri oka** (postavka institucije, početno isključeno): urednik ne objavljuje objavu koju je sam napisao ili poslao; administrator može, uz posebnu oznaku u dnevniku.
- **Verzije**: svako spremanje koje mijenja sadržaj i svaka promjena statusa pravi verziju (`post_versions`, s RLS-om). U CMS-u: historija, poređenje polja i teksta po redovima, vraćanje sadržaja iz stare verzije (nastaje nova verzija, ništa se ne briše).
- **Zakazivanje i automatsko povlačenje**: portal prikazuje objavu samo između `publishedAt` i `unpublishAt`. Posao svake minute (s advisory lockom) usklađuje statuse (ZAKAZANO → OBJAVLJENO, istekao `unpublishAt` → POVUCENO) i upisuje to u dnevnik institucije kao „Sistem (raspored)”.
- Test `posts.test.ts` nad pravom bazom pokriva sve prelaze, zaključavanje, napomene, četiri oka, verzije i zakazivanje.
