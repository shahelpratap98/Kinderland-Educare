import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { reviews, reviewSummary } from "@/lib/content";

/**
 * What parents say.
 *
 * On the stars: they are `aria-hidden` and the rating is also written out as
 * text. That matters because sun yellow is about 1.7:1 on white — well under the
 * 3:1 that WCAG 1.4.11 asks of any graphic you need in order to understand the
 * page. Gold stars are the convention and a brown-gold that passed would look
 * wrong, so the rating is carried by the words instead and the stars are
 * decoration. Nothing here depends on seeing the colour.
 *
 * No Review or AggregateRating markup — see the note in lib/content.ts.
 */
export function Reviews() {
  return (
    <section
      id="reviews"
      className="border-y border-hairline bg-wash"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2
              id="reviews-heading"
              className="text-4xl font-normal text-ink sm:text-5xl"
            >
              What parents say
            </h2>
            <p className="mt-3 max-w-xl text-lg text-muted">
              A few words from families at the centre.
            </p>
          </div>

          <a
            href={reviewSummary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-background px-5 py-3 hairline transition-transform duration-200 ease-out-strong active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02]"
          >
            <span className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-sun-400 text-sun-400" />
              ))}
            </span>
            <span className="text-[15px] text-ink">
              <strong className="font-semibold">{reviewSummary.rating}</strong>{" "}
              out of 5
              <span className="text-muted">
                {" "}
                · {reviewSummary.count} {reviewSummary.source} reviews
              </span>
            </span>
          </a>
        </div>

        <ul className="grid gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.author}>
              <Card className="flex h-full flex-col p-6 sm:p-7">
                <span className="flex items-center gap-0.5" aria-hidden>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-sun-400 text-sun-400" />
                  ))}
                </span>

                <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-muted">
                  {review.quote}
                </blockquote>

                <p className="mt-5 text-[15px] font-medium text-ink">
                  {review.author}
                  <span className="sr-only">
                    {" "}
                    — rated {review.rating} out of 5
                  </span>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
