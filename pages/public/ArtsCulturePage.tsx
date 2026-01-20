import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const ArtsCulturePage: React.FC = () => {
    return (
        <div className="relative py-16">
            <div 
                className="absolute inset-0 bg-cover bg-center bg-fixed" 
                style={{ backgroundImage: "url('https://i.ibb.co/jPvswhZt/473249294-1015300233962686-4114946528800957864-n.jpg')" }}
            ></div>
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Arts & Culture</h1>
                        <p className="mt-4 text-lg text-slate-600">Celebrating Creativity and Heritage</p>
                    </div>

                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <p>At Bethel Mission School, Bethel Veng, Champhai, we believe that education extends beyond academics into the nurturing of cultural identity and artistic expression. Our students are encouraged to celebrate creativity, embrace their heritage, and use art as a medium for awareness and unity. The school provides a vibrant platform for music, dance, drama, and cultural performances, ensuring that every student can discover and develop their talents.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">The Dance Club: A Legacy of Excellence</h2>
                            <p>The Dance Club of our school has been one of the most active and successful groups in showcasing this spirit. Over the years, our students have excelled in various cultural competitions, winning recognition both within and outside the district. Notable achievements include:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong>1st Prize</strong> in the Vengthlang YMA Cheerleading Competition (2014)</li>
                                <li><strong>3rd Prize</strong> in the CCN Dance Competition (2015)</li>
                                <li><strong>1st Prize</strong> in the Junior Category of Praise Dance (2016)</li>
                                <li><strong>1st Prize</strong> in the Mizo Hnamlam Intihsiak (H/S category) in 2024</li>
                                <li><strong>3rd Prize</strong> in the Mob Dance on HIV Awareness (2024)</li>
                            </ul>
                            <p className="mt-4">These accomplishments reflect not only talent but also the ability to use art as a powerful voice for community and social issues.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Annual Cultural Event</h2>
                            <p>To further encourage cultural awareness and unity, the school organizes an Annual Cultural Event at the end of every calendar year. This celebration is a showcase of traditional and modern art forms, including dances, songs, dramas, and creative displays by students. It provides an opportunity for every learner to experience the richness of Mizo culture while also embracing diversity and new ideas. The event stands as a testimony to the school’s commitment to holistic education, where arts and culture are cherished as essential to shaping confident, well-rounded individuals.</p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Glimpses of Our Culture</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <figure>
                                <img src="https://i.ibb.co/3yLj5hLs/486552052-1071019135057462-4778827989130498675-n.jpg" alt="Students performing a cultural dance" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video" />
                                <figcaption className="mt-2 text-center text-sm text-slate-600 italic">Students in traditional attire.</figcaption>
                            </figure>
                            <figure>
                                <img src="https://i.ibb.co/cXMTZbGZ/510439662-24227472690210439-1781996875253238322-n.jpg" alt="Another cultural performance" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video" />
                                <figcaption className="mt-2 text-center text-sm text-slate-600 italic">A vibrant group performance.</figcaption>
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtsCulturePage;