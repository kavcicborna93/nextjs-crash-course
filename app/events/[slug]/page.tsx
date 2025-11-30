import React from 'react';
import EventCard from "@/components/EventCard";
import {notFound} from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsPage = async ({params}: { params: Promise<{slug: string}>}) => {
    const {slug} = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const {event} = await request.json();

    if (!event) return notFound();
    return (
        <section id ="event">
            <h1>Event Details: <br/> </h1>
            <EventCard {...event}/>
        </section>
    );
};

export default EventDetailsPage;