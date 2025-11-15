import ExploreBtn from "@/components/ExploreBtn";

const Page = () => {
    return (
        <div>
            <section>
                <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't miss</h1>
                <p className="text-center mt-5">Hackathons, Meetups and Conferences, All in One Place</p>
                <ExploreBtn/>

                <div className="events">
                    <h3>Featured Events</h3>

                    <ul className="events">
                        {[1, 2, 3, 4, 5].map(event => <li key={event}>Event {event}</li>)}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Page;