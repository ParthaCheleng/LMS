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
        { title: 'React Essentials', slug: 'react-essentials', category: 'Frontend', description: 'Learn React from the ground up — components, props, state, hooks, and routing.', price: 29.99 },
        { title: 'Node.js Backend Development', slug: 'nodejs-backend', category: 'Backend', description: 'Build production-ready REST APIs with Node.js and Express.', price: 39.99 },
        { title: 'Fullstack Next.js Masterclass', slug: 'nextjs-masterclass', category: 'Fullstack', description: 'Build end-to-end applications with Next.js App Router and Prisma.', price: 49.99 },
        { title: 'Cybersecurity Fundamentals', slug: 'cybersecurity-fundamentals', category: 'Cybersecurity', description: 'Learn the core principles of network security, cryptography, and risk management.', price: 0 },
        { title: 'Blockchain & Smart Contracts', slug: 'blockchain-smart-contracts', category: 'Blockchain', description: 'Understand blockchain technology and write your first Solidity smart contracts.', price: 59.99 },
        { title: 'Object-Oriented Programming Patterns', slug: 'oop-patterns', category: 'OOPs', description: 'Master design patterns and SOLID principles to write robust object-oriented code.', price: 19.99 },
        { title: 'AI & Machine Learning 101', slug: 'ai-ml-101', category: 'AI', description: 'Introduction to neural networks, models, and generative AI concepts.', price: 69.99 },
        { title: 'Python for Data Science', slug: 'python-data-science', category: 'Python', description: 'Learn Python programming with a focus on data analysis and visualization using pandas.', price: 34.99 },
        { title: 'Java Spring Boot Microservices', slug: 'java-spring-boot', category: 'Java', description: 'Learn how to build scalable microservices architecture using Java and Spring Boot.', price: 44.99 },
        { title: 'Angular Mastery', slug: 'angular-mastery', category: 'Angular', description: 'Comprehensive guide to building enterprise-level applications with Angular and RxJS.', price: 39.99 }
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
                currency: 'USD'
            }
        });
        createdSubjects.push(created);
    }

    console.log(`✅ Subjects created: 10 categories`);

    // Create 5 sections (modules) with 3 videos each per subject
    const sectionTemplates = [
        'Introduction & Setup',
        'Core Concepts',
        'Intermediate Techniques',
        'Advanced Patterns',
        'Real-World Projects'
    ];

    const videoTemplates = [
        ['Overview & Welcome', 'Environment Setup', 'Your First Steps'],
        ['Key Fundamentals', 'Working with Data', 'Building Blocks'],
        ['Design Patterns', 'Error Handling', 'Testing Strategies'],
        ['Performance Optimization', 'Security Best Practices', 'Scaling Techniques'],
        ['Capstone Project Part 1', 'Capstone Project Part 2', 'Deployment & Review']
    ];

    const youtubeUrls = [
        'https://youtu.be/zQnBQ4tB3ZA',
        'https://youtu.be/upDLs1sn7g4',
        'https://youtu.be/7qpE9rjfDXo',
        'https://youtu.be/1Rs2ND1ryYc',
        'https://youtu.be/dQw4w9WgXcQ'
    ];

    let videoCount = 0;
    let sectionCount = 0;
    for (const subject of createdSubjects) {
        const numModules = Math.floor(Math.random() * 3) + 3; // Randomly 3, 4, or 5 modules
        for (let si = 0; si < numModules; si++) {
            const section = await prisma.section.create({
                data: { subjectId: subject.id, title: sectionTemplates[si], orderIndex: si }
            });

            const videosData = videoTemplates[si].map((title, vi) => ({
                sectionId: section.id,
                title: `${title} — ${subject.category}`,
                description: `${title} for ${subject.title}`,
                youtubeUrl: youtubeUrls[(si + vi) % youtubeUrls.length],
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
