import prisma from './src/core/lib/prisma.js';

const id = '5222af88-f0a1-447c-8bca-d6b1b5fe7485';
const auction = await prisma.auction.findUnique({
  where: { id },
  include: { listing: { select: { status: true, sellingMode: true } } }
});

if (!auction) {
  console.log('❌ Auction NOT found in DB');
  // Show all auctions
  const all = await prisma.auction.findMany({ select: { id: true, status: true, endsAt: true } });
  console.log('All auctions:', all);
} else {
  console.log('Auction:', {
    id: auction.id,
    status: auction.status,
    endsAt: auction.endsAt,
    listingStatus: auction.listing?.status
  });
}

await prisma.$disconnect();
