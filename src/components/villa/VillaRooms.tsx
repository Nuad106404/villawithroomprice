import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bed, Bath, Maximize } from 'lucide-react';

const rooms = [
  {
    id: 'master',
    name: 'Master Suite',
    description: 'Luxurious master bedroom with ocean view, king-size bed, and en-suite bathroom',
    size: 45,
    beds: 1,
    baths: 1,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'guest1',
    name: 'Guest Room 1',
    description: 'Spacious guest room with garden view, queen-size bed, and shared bathroom',
    size: 35,
    beds: 1,
    baths: 1,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'guest2',
    name: 'Guest Room 2',
    description: 'Cozy guest room with twin beds, perfect for children or friends',
    size: 30,
    beds: 2,
    baths: 1,
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80'
  }
];

export function VillaRooms() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {room.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {room.description}
              </p>
              <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm">{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="w-4 h-4" />
                  <span className="text-sm">{room.baths} Bath</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Maximize className="w-4 h-4" />
                  <span className="text-sm">{room.size} m²</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
