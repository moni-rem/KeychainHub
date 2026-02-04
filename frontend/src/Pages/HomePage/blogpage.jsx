
import React from "react";

export default function Blogpage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          🔑 Small Accessory, Big Impact: The Story of Keychains
        </h1>

        {/* Meta */}
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
          Posted by <span className="font-semibold">KeychainHub</span> •{" "}
          {new Date().toLocaleDateString()}
        </p>

        {/* Content */}
        <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-200 leading-relaxed">
          <p>
            When we think about everyday essentials, keychains are often the last
            thing on our minds. Yet, they are one of the few accessories we
            carry with us everywhere we go. Simple, practical, and personal,
            keychains play a bigger role in our daily lives than we usually
            realize.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🗝️ More Than Just a Key Holder
            </h2>
            <p>
              At its core, a keychain helps keep your keys organized and easy to
              find. But modern keychains are no longer just functional items.
              Today, they are also fashion accessories, collectibles, and
              meaningful personal items.
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Prevent you from losing your keys</li>
              <li>Add style to your bag or pocket</li>
              <li>Make daily routines more convenient</li>
            </ul>

            <p className="mt-4">
              Sometimes, the smallest accessories make the biggest difference.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🎨 A Reflection of Your Personality
            </h2>
            <p>
              Keychains are a subtle way to express who you are. Some people
              love cute or colorful designs, while others prefer minimalist or
              elegant styles. From cartoon characters and symbols to leather and
              metal finishes, there’s a keychain for every personality.
            </p>

            <p className="mt-4">Your keychain might represent:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Your hobbies or interests</li>
              <li>A favorite memory or place</li>
              <li>A personal belief or motivation</li>
            </ul>

            <p className="mt-4">
              It’s a small detail, but it tells a story.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🎁 A Thoughtful and Practical Gift
            </h2>
            <p>
              Keychains are one of the most popular gift items—and for good
              reason. They are affordable, useful, and easy to personalize.
              Whether it’s a birthday, anniversary, or souvenir from a trip, a
              keychain makes a meaningful gift without being too expensive.
            </p>

            <p className="mt-4">
              Personalized keychains, such as engraved names or special dates,
              turn an everyday item into a lasting memory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🧰 Designed for Everyday Convenience
            </h2>
            <p>
              Many modern keychains come with extra features that make life
              easier. Some include bottle openers, flashlights, phone holders,
              or trackers. These multifunctional designs are perfect for people
              who value practicality and smart design.
            </p>

            <p className="mt-4">
              A good keychain isn’t just stylish—it’s useful.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🌱 Small Choices, Sustainable Impact
            </h2>
            <p>
              Eco-friendly keychains made from recycled materials, wood, or
              fabric are becoming more popular. Choosing durable and sustainable
              accessories helps reduce waste and supports a more responsible
              lifestyle.
            </p>

            <p className="mt-4">
              Sometimes, sustainability starts with small choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🛍️ Find the Keychain That Fits You
            </h2>
            <p>
              Whether you like something fun, elegant, or meaningful, there’s a
              keychain that fits your style. It’s a small accessory, but it’s
              one you interact with every single day.
            </p>

            <div className="mt-6 p-5 rounded-xl bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">
                At KeychainHub, we believe that even the smallest items should
                bring value, style, and joy into your life.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="/shop"
                className="inline-flex justify-center items-center rounded-lg px-5 py-3 font-semibold bg-blue-600 text-white hover:opacity-90 transition"
              >
                Browse Keychains
              </a>
              <a
                href="/contact"
                className="inline-flex justify-center items-center rounded-lg px-5 py-3 font-semibold border border-gray-300 dark:border-gray-600 hover:opacity-90 transition"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
