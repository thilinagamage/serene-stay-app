import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

const locations = ["galle", "colombo", "matara"];

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;

  const where: Record<string, unknown> = {};
  if (location && locations.includes(location)) where.location = location;

  const rooms = await prisma.room.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-16 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-600">
          Our Rooms
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Find your perfect stay
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/rooms"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !location
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            All
          </Link>
          {locations.map((loc) => (
            <Link
              key={loc}
              href={`/rooms?location=${loc}`}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                location === loc
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              {loc}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {room.imageUrl && (
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-stone-100">
                  <Image
                    src={room.imageUrl}
                    alt={room.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">
                    {room.name}
                  </h3>
                  <p className="mt-1 text-xs capitalize text-stone-500">
                    {room.location}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
                    {room.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                <p className="text-lg font-semibold text-stone-900">
                  LKR {room.price.toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-stone-500">
                    / night
                  </span>
                </p>
                <p className="text-sm text-stone-500">
                  Up to {room.capacity} guests
                </p>
              </div>
            </Link>
          ))}
          {rooms.length === 0 && (
            <p className="col-span-full py-12 text-center text-stone-500">
              No rooms found for this location.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
