import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "../../../../database/event.model";

type RouteParams = {
    params: Promise<{slug:string}>;
}
export async function GET(req: NextRequest, {params}: RouteParams) {
    try {
        await connectDB();
        const slug = await params;
        // return sorted events, newer first //
        const event = await Event.findOne(slug).lean();

        if (!event) {
            return NextResponse.json({error: "Event not found"}, {status: 404});
        }

        return NextResponse.json({message: 'Event fetched successfully', event}, {status: 200});
    } catch (e) {
        if (e instanceof Error) {
            if (e.message.includes('MONGODB_URI')) {
                return NextResponse.json({error:"Database configuration error"});
            }
            return NextResponse.json({message: 'Event fetching failed', error: e}, {status: 500});
        }
    }

    return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
}