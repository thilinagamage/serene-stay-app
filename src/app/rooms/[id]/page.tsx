import Image from "next/image";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import ReviewList from "./ReviewList";

export default async function RoomDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!room) notFound();

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-16 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {room.imageUrl && (
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-stone-100 sm:h-80">
            <Image
              src={room.imageUrl}
              alt={room.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
              className="object-cover"
            />
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              {room.location}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
              {room.name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
              <span>Up to {room.capacity} guests</span>
              {room.featured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Featured
                </span>
              )}
            </p>
            <p className="mt-6 text-base leading-7 text-stone-700">
              {room.description}
            </p>

            <div className="mt-10">
              <ReviewList reviews={room.reviews} roomId={room.id} />
            </div>
          </div>

          <div>
            <div className="sticky top-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-2xl font-semibold text-stone-900">
                LKR {room.price.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-stone-500">
                  / night
                </span>
              </p>
              <div className="mt-6">
                <BookingForm roomId={room.id} price={room.price} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
