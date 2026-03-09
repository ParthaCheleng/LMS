import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clean up existing data for idempotent re-seeding
    await prisma.videoProgress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.video.deleteMany();
    await prisma.section.deleteMany();
    await prisma.subject.deleteMany();
    console.log('🧹 Cleaned existing data');

    // Create a demo user
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            passwordHash,
            name: 'Demo Student',
        },
    });
    console.log(`✅ User created: ${user.email}`);

    // Create subjects for the 10 categories
    const subjectsData = [
        { title: 'React Essentials', slug: 'react-essentials', category: 'Frontend', description: 'Learn React from the ground up — components, props, state, hooks, and routing.', price: 29.99, thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=400&fit=crop' },
        { title: 'Node.js Backend Development', slug: 'nodejs-backend', category: 'Backend', description: 'Build production-ready REST APIs with Node.js and Express.', price: 39.99, thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop' },
        { title: 'Fullstack Next.js Masterclass', slug: 'nextjs-masterclass', category: 'Fullstack', description: 'Build end-to-end applications with Next.js App Router and Prisma.', price: 49.99, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
        { title: 'Cybersecurity Fundamentals', slug: 'cybersecurity-fundamentals', category: 'Cybersecurity', description: 'Learn the core principles of network security, cryptography, and risk management.', price: 0, thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop' },
        { title: 'Blockchain & Smart Contracts', slug: 'blockchain-smart-contracts', category: 'Blockchain', description: 'Understand blockchain technology and write your first Solidity smart contracts.', price: 59.99, thumbnail: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&h=400&fit=crop' },
        { title: 'Object-Oriented Programming Patterns', slug: 'oop-patterns', category: 'OOPs', description: 'Master design patterns and SOLID principles to write robust object-oriented code.', price: 19.99, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
        { title: 'AI & Machine Learning 101', slug: 'ai-ml-101', category: 'AI', description: 'Introduction to neural networks, models, and generative AI concepts.', price: 69.99, thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop' },
        { title: 'Python for Data Science', slug: 'python-data-science', category: 'Python', description: 'Learn Python programming with a focus on data analysis and visualization using pandas.', price: 34.99, thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop' },
        { title: 'Java Spring Boot Microservices', slug: 'java-spring-boot', category: 'Java', description: 'Learn how to build scalable microservices architecture using Java and Spring Boot.', price: 44.99, thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=600&h=400&fit=crop' },
        { title: 'Angular Mastery', slug: 'angular-mastery', category: 'Angular', description: 'Comprehensive guide to building enterprise-level applications with Angular and RxJS.', price: 39.99, thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop' }
    ];

    const createdSubjects = [];
    for (const sub of subjectsData) {
        const created = await prisma.subject.create({
            data: {
                title: sub.title,
                slug: sub.slug,
                category: sub.category,
                description: sub.description,
                isPublished: true,
                price: sub.price,
                currency: 'USD',
                thumbnail: sub.thumbnail
            }
        });
        createdSubjects.push(created);
    }

    console.log(`✅ Subjects created: 10 categories`);

    // ─── Per-subject video URL mappings ──────────────────────────────────
    // Each key is the subject slug. Each entry is an array of sections,
    // where each section has a title and an array of [videoTitle, youtubeUrl].

    type SectionDef = { title: string; videos: [string, string][] };
    type SubjectVideos = Record<string, SectionDef[]>;

    const subjectVideos: SubjectVideos = {
        'angular-mastery': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Angular', 'https://www.youtube.com/watch?v=3qBXWUpoPHo'],
                    ['Environment Setup — Angular', 'https://www.youtube.com/watch?v=NgXfQd3E6A8'],
                    ['Your First Steps — Angular', 'https://www.youtube.com/watch?v=2OHbjep_WjQ'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Angular', 'https://www.youtube.com/watch?v=k5E2AVpwsko'],
                    ['Working with Data — Angular', 'https://www.youtube.com/watch?v=2idgYvV3Xj0'],
                    ['Building Blocks — Angular', 'https://www.youtube.com/watch?v=23o0evRtrFI'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Angular', 'https://www.youtube.com/watch?v=ZhfUv0spHCY'],
                    ['Error Handling — Angular', 'https://www.youtube.com/watch?v=F0DHo9Pzj1M'],
                    ['Testing Strategies — Angular', 'https://www.youtube.com/watch?v=Kq6wCzK6sPg'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — Angular', 'https://www.youtube.com/watch?v=0S4pR1C8VbA'],
                    ['Security Best Practices — Angular', 'https://www.youtube.com/watch?v=0H7P9bKcQKc'],
                    ['Scaling Techniques — Angular', 'https://www.youtube.com/watch?v=VX7mVq4H6n8'],
                ]
            },
            {
                title: 'Real-World Projects', videos: [
                    ['Capstone Project Part 1 — Angular', 'https://www.youtube.com/watch?v=3dHNOWTI7H8'],
                    ['Capstone Project Part 2 — Angular', 'https://www.youtube.com/watch?v=7p4AqA9eXzE'],
                    ['Deployment & Review — Angular', 'https://www.youtube.com/watch?v=1Z1ZzBv0C8k'],
                ]
            },
        ],
        'oop-patterns': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — OOP', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                    ['Environment Setup — OOP', 'https://www.youtube.com/watch?v=Ej_02ICOIgs'],
                    ['Your First Steps — OOP', 'https://www.youtube.com/watch?v=SiBw7os-_zI'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — OOP', 'https://www.youtube.com/watch?v=JeznW_7DlB0'],
                    ['Working with Data — OOP', 'https://www.youtube.com/watch?v=Gx4iBLKLVHk'],
                    ['Building Blocks — OOP', 'https://www.youtube.com/watch?v=SS-9y0H3Si8'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — OOP', 'https://www.youtube.com/watch?v=NU_1StN5Tkk'],
                    ['Error Handling — OOP', 'https://www.youtube.com/watch?v=0Rk9KkHk0z8'],
                    ['Testing Strategies — OOP', 'https://www.youtube.com/watch?v=sU3j6cJ0h4I'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — OOP', 'https://www.youtube.com/watch?v=ffVt6E4Tg4g'],
                    ['Security Best Practices — OOP', 'https://www.youtube.com/watch?v=9JqH7b2k7e0'],
                    ['Scaling Techniques — OOP', 'https://www.youtube.com/watch?v=ZgdS0EUmn70'],
                ]
            },
            {
                title: 'Real-World Projects', videos: [
                    ['Capstone Project Part 1 — OOP', 'https://www.youtube.com/watch?v=8jLOx1hD3_o'],
                    ['Capstone Project Part 2 — OOP', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
                    ['Deployment & Review — OOP', 'https://www.youtube.com/watch?v=6T_HgnjoYwM'],
                ]
            },
        ],
        'ai-ml-101': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — AI', 'https://www.youtube.com/watch?v=2ePf9rue1Ao'],
                    ['Environment Setup — AI', 'https://www.youtube.com/watch?v=7eh4d6sabA0'],
                    ['Your First Steps — AI', 'https://www.youtube.com/watch?v=GwIo3gDZCVQ'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — AI/ML', 'https://www.youtube.com/watch?v=aircAruvnKk'],
                    ['Working with Data — AI', 'https://www.youtube.com/watch?v=ua-CiDNNj30'],
                    ['Building Blocks — AI Models', 'https://www.youtube.com/watch?v=ukzFI9rgwfU'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — AI Systems', 'https://www.youtube.com/watch?v=06-AZXmwHjo'],
                    ['Error Handling — ML Models', 'https://www.youtube.com/watch?v=HdlDYng8g9s'],
                    ['Testing Strategies — ML', 'https://www.youtube.com/watch?v=2QxC6a1P1lI'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — ML', 'https://www.youtube.com/watch?v=9zhrxE5PQgY'],
                    ['Security Best Practices — AI', 'https://www.youtube.com/watch?v=7a4cF9F5p9g'],
                    ['Scaling Techniques — ML Systems', 'https://www.youtube.com/watch?v=HnJ7E9k7r0U'],
                ]
            },
        ],
        'python-data-science': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Python', 'https://www.youtube.com/watch?v=LHBE6Q9XlzI'],
                    ['Environment Setup — Python', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'],
                    ['Your First Steps — Python', 'https://www.youtube.com/watch?v=rfscVS0vtbw'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Python', 'https://www.youtube.com/watch?v=_uQrJ0TkZlc'],
                    ['Working with Data — Python', 'https://www.youtube.com/watch?v=vmEHCJofslg'],
                    ['Building Blocks — Python Libraries', 'https://www.youtube.com/watch?v=LHBE6Q9XlzI&t=5000s'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Python', 'https://www.youtube.com/watch?v=bsyjSW46TDg'],
                    ['Error Handling — Python', 'https://www.youtube.com/watch?v=NIWwJbo-9_8'],
                    ['Testing Strategies — Python', 'https://www.youtube.com/watch?v=DhUpxWjOhME'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — Python', 'https://www.youtube.com/watch?v=YjHsOrOOSuI'],
                    ['Security Best Practices — Python', 'https://www.youtube.com/watch?v=Kx7sXzabU8Q'],
                    ['Scaling Techniques — Python', 'https://www.youtube.com/watch?v=9xjJb8G0C5k'],
                ]
            },
        ],
        'java-spring-boot': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Spring Boot', 'https://www.youtube.com/watch?v=vtPkZShrvXQ'],
                    ['Environment Setup — Spring Boot', 'https://www.youtube.com/watch?v=9SGDpanrc8U'],
                    ['Your First Steps — Spring Boot', 'https://www.youtube.com/watch?v=35EQXmHKZYs'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Spring Boot', 'https://www.youtube.com/watch?v=9SGDpanrc8U'],
                    ['Working with Data — Spring Data JPA', 'https://www.youtube.com/watch?v=8SGI_XS5OPw'],
                    ['Building Blocks — Microservices', 'https://www.youtube.com/watch?v=rv4LlmLmVWk'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Microservices', 'https://www.youtube.com/watch?v=1xo-0gCVhTU'],
                    ['Error Handling — Spring Boot', 'https://www.youtube.com/watch?v=2y3g1A3X6mY'],
                    ['Testing Strategies — Spring Boot', 'https://www.youtube.com/watch?v=Geq60OVyBPg'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — Spring Boot', 'https://www.youtube.com/watch?v=VvC0VnK6Q3g'],
                    ['Security Best Practices — Spring Security', 'https://www.youtube.com/watch?v=her_7pa0vrg'],
                    ['Scaling Techniques — Microservices', 'https://www.youtube.com/watch?v=rv4LlmLmVWk'],
                ]
            },
        ],
        'react-essentials': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Frontend', 'https://youtu.be/Tn6-PIqc4UM'],
                    ['Environment Setup — Frontend', 'https://youtu.be/L2A8hMSeyDs'],
                    ['Your First Steps — Frontend', 'https://youtu.be/SqcY0GlETPk'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Frontend', 'https://youtu.be/s2skans2dP4'],
                    ['Working with Data — Frontend', 'https://youtu.be/00lxm_doFYw'],
                    ['Building Blocks — Frontend', 'https://youtu.be/B2l2wGSGo9o'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Frontend', 'https://youtu.be/MdvzlDIdQ0o'],
                    ['Error Handling — Frontend', 'https://youtu.be/OQQAv8t3bfc'],
                    ['Testing Strategies — Frontend', 'https://youtu.be/8Xwq35cPwYg'],
                ]
            },
        ],
        'nodejs-backend': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Backend', 'https://youtu.be/KOutPbKc9UM'],
                    ['Environment Setup — Backend', 'https://youtu.be/KaHUq3QCJgY'],
                    ['Your First Steps — Backend', 'https://youtu.be/TlB_eWDSMt4'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Backend', 'https://youtu.be/ENrzD9HAZK4'],
                    ['Working with Data — Backend', 'https://youtu.be/ha_leEpnT30'],
                    ['Building Blocks — Backend', 'https://youtu.be/fc6o1gwqZuA'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Backend', 'https://youtu.be/6NvE_TI7lrI'],
                    ['Error Handling — Backend', 'https://youtu.be/mGPj-pCGS2c'],
                    ['Testing Strategies — Backend', 'https://youtu.be/Jv2uxzhPFl4'],
                ]
            },
        ],
        'nextjs-masterclass': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Fullstack', 'https://youtu.be/3qGQ4dGA42o'],
                    ['Environment Setup — Fullstack', 'https://youtu.be/GiCtV-vT4KM'],
                    ['Your First Steps — Fullstack', 'https://youtu.be/ZVnjOPwW4ZA'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Fullstack', 'https://youtu.be/LkDelp5WWYU'],
                    ['Working with Data — Fullstack', 'https://youtu.be/gSSsZReIFRk'],
                    ['Building Blocks — Fullstack', 'https://youtu.be/rUm4cc-ciWE'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Fullstack', 'https://youtu.be/WaFBiDgqctY'],
                    ['Error Handling — Fullstack', 'https://youtu.be/8iaR2l3ckuE'],
                    ['Testing Strategies — Fullstack', 'https://youtu.be/D9PM96W_p7c'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — Fullstack', 'https://youtu.be/TvrQnBDIDpI'],
                    ['Security Best Practices — Fullstack', 'https://youtu.be/DJvM2lSPn6w'],
                    ['Scaling Techniques — Fullstack', 'https://youtu.be/WkZCGWWmxNM'],
                ]
            },
            {
                title: 'Real-World Projects', videos: [
                    ['Capstone Project Part 1 & 2', 'https://youtu.be/MwFbOM1aIAs'],
                    ['Deployment & Review — Fullstack', 'https://youtu.be/I1V9YWqRIeI'],
                ]
            },
        ],
        'cybersecurity-fundamentals': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Cybersecurity', 'https://youtu.be/5MMoxyK1Y9o'],
                    ['Environment Setup — Cybersecurity', 'https://youtu.be/izmCJlJEvQw'],
                    ['Your First Steps — Cybersecurity', 'https://youtu.be/b12JrM-6DBY'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Cybersecurity', 'https://youtu.be/inWWhr5tnEA'],
                    ['Working with Data — Cybersecurity', 'https://youtu.be/OcXu9B-A0UU'],
                    ['Building Blocks — Cybersecurity', 'https://youtu.be/lVbsZ7hXsT8'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Cybersecurity', 'https://youtu.be/5nGIAAy3DXQ'],
                    ['Error Handling — Cybersecurity', 'https://youtu.be/qHiZf9P0rW0'],
                    ['Testing Strategies — Cybersecurity', 'https://youtu.be/B7tTQ272OHE'],
                ]
            },
            {
                title: 'Advanced Patterns', videos: [
                    ['Performance Optimization — Cybersecurity', 'https://youtu.be/0L7HoR3l52Y'],
                    ['Security Best Practices — Cybersecurity', 'https://youtu.be/jq_LZ1RFPfU'],
                    ['Scaling Techniques — Cybersecurity', 'https://youtu.be/24K91_aKMSA'],
                ]
            },
            {
                title: 'Real-World Projects', videos: [
                    ['Capstone Project Part 1 & 2', 'https://youtu.be/-vyVT6H5kns'],
                    ['Deployment & Review — Cybersecurity', 'https://youtu.be/2BOOl8_nwjQ'],
                ]
            },
        ],
        'blockchain-smart-contracts': [
            {
                title: 'Introduction & Setup', videos: [
                    ['Overview & Welcome — Blockchain', 'https://youtu.be/yubzJw0uiE4'],
                    ['Environment Setup — Blockchain', 'https://youtu.be/rxK3UXld8xY'],
                    ['Your First Steps — Blockchain', 'https://youtu.be/Mp-d7m0py4g'],
                ]
            },
            {
                title: 'Core Concepts', videos: [
                    ['Key Fundamentals — Blockchain', 'https://youtu.be/SSo_EIwHSd4'],
                    ['Working with Data — Blockchain', 'https://youtu.be/RQzuQb0dfBM'],
                    ['Building Blocks — Blockchain', 'https://youtu.be/pyaIppMhuic'],
                ]
            },
            {
                title: 'Intermediate Techniques', videos: [
                    ['Design Patterns — Blockchain', 'https://youtu.be/RQVDU8L_c6Q'],
                    ['Error Handling — Blockchain', 'https://youtu.be/8TfY-1Gjwc4'],
                    ['Testing Strategies — Blockchain', 'https://youtu.be/4kLA7Z6dP34'],
                ]
            },
        ],
    };

    // ─── Create sections and videos per subject ────────────────────────
    let videoCount = 0;
    let sectionCount = 0;

    for (const subject of createdSubjects) {
        const slug = subjectsData.find(s => s.title === subject.title)!.slug;
        const sections = subjectVideos[slug];

        if (!sections) {
            console.warn(`⚠️  No video data for slug "${slug}", skipping.`);
            continue;
        }

        for (let si = 0; si < sections.length; si++) {
            const sectionDef = sections[si];
            const section = await prisma.section.create({
                data: { subjectId: subject.id, title: sectionDef.title, orderIndex: si }
            });

            const videosData = sectionDef.videos.map(([title, url], vi) => ({
                sectionId: section.id,
                title,
                description: `${title} for ${subject.title}`,
                youtubeUrl: url,
                orderIndex: vi,
                durationSeconds: 300 + Math.floor(Math.random() * 900),
            }));

            await prisma.video.createMany({ data: videosData });
            videoCount += videosData.length;
            sectionCount++;
        }
    }

    // Create enrollment for demo user on Fullstack Next.js course
    const fullstackCourse = createdSubjects[2];
    if (fullstackCourse) {
        await prisma.enrollment.create({
            data: {
                userId: user.id,
                subjectId: fullstackCourse.id,
            },
        });
    }

    console.log('✅ Seed completed successfully!');
    console.log(`📊 Created 10 subjects, ${sectionCount} sections, ${videoCount} videos`);
    console.log(`👤 Demo user: student@example.com / password123`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
