import OtherAnalytics from "@/app/components/analytics/OtherAnalytics"

const page = async ({ params }) => {
    const { username } = await params

    return (
        <div>
            <OtherAnalytics username={username} />
        </div>
    )
}

export default page
