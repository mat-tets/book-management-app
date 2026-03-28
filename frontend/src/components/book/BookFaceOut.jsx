import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useLocation } from "react-router-dom";

import useEmblaCarousel from "embla-carousel-react";

import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import styles from "./BookFaceOut.module.css";
import BookImage from "./BookImage";

const LIMIT = 6;

const BookFaceOut = ({ books }) => {
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  // 書籍を押下すると、モーダル表示
  const navigateBookModal = (book) => {
    navigateVT(`/bookshelf/${book.id}`, {
      state: { book, backgroundLocation: location },
    });
  };

  // Embla Carouselの設定
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    slidesToScroll: 5,
  });

  const handleNext = () => {
    if (!emblaApi || !emblaApi.canScrollNext()) return;
    emblaApi.scrollNext();
  };

  const handlePrev = () => {
    if (!emblaApi || !emblaApi.canScrollPrev()) return;
    emblaApi.scrollPrev();
  };

  if (!books) return;

  const skeleton = Math.max(0, LIMIT - books.length);

  return (
    <div className={styles.root}>
      <div className={styles.slider} ref={emblaRef}>
        <ul className={styles.lists}>
          {books.map((book) => (
            <li
              key={book.id}
              className={styles.list}
              onClick={() => navigateBookModal(book)}
            >
              <div className={styles.image}>
                <BookImage title={book.title} coverUrl={book.coverUrl} />
              </div>
            </li>
          ))}
          {Array.from({ length: skeleton }).map((_, i) => (
            <li key={`skeleton-${i}`} className={styles.list}>
              <div className={styles.image}></div>
            </li>
          ))}
        </ul>
      </div>
      <button
        className={`${styles.button} ${styles.prev}`}
        type="button"
        onClick={handlePrev}
      >
        <MdKeyboardArrowLeft />
      </button>
      <button
        className={`${styles.button} ${styles.next}`}
        type="button"
        onClick={handleNext}
      >
        <MdKeyboardArrowRight />
      </button>
    </div>
  );
};

export default BookFaceOut;
