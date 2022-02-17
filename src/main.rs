#![allow(non_snake_case)]

mod api;

use api::types::*;
use dioxus::prelude::*;
use dioxus::router::*;

fn main() {
    dioxus::web::launch(app);
}

fn app(cx: Scope) -> Element {
    cx.render(rsx! {
        Router {
            div { class: "app mb-2",
                div { class: "bg-gray-900 mb-3",
                    nav { class: "container flex flex-row space-x-4 mx-auto py-4",
                        Link { to: "/", class: "text-center font-bold text-gray-200 hover:text-gray-100 transition", "HN" }
                        Link { to: "/new", class: "text-center font-bold text-gray-200 hover:text-gray-100 transition", "Latest" }
                        Link { to: "/best", class: "text-center font-bold text-gray-200 hover:text-gray-100 transition", "Best" }
                        Link { to: "/show", class: "text-center font-bold text-gray-200 hover:text-gray-100 transition", "Show" }
                        div { class: "flex-1" }
                        Link { to: "https://dioxuslabs.com", class: "font-light text-white", "Built with Dioxus" }
                    }
                }
                div { class: "container mx-auto",
                    Route { to: "/", Stories { sort: StorySorting::Top } }
                    Route { to: "/new", Stories { sort: StorySorting::New } }
                    Route { to: "/best", Stories { sort: StorySorting::Best } }
                    Route { to: "/show", Stories { sort: StorySorting::Show } }
                    Route { to: "/item/:id", StorySubmission {} }
                }
            }
        }
    })
}

#[inline_props]
fn Stories(cx: Scope, sort: StorySorting) -> Element {
    let story = use_future(&cx, || api::get_stories(*sort));

    let stories = match story.value() {
        Some(Ok(list)) => list.iter().map(|story| rsx!(StoryListing { story: story })),
        Some(Err(e)) => return cx.render(rsx! { "An error occured" }),
        None => return cx.render(rsx! { "Loading items" }),
    };

    cx.render(rsx! {
        ul { class: "list-none space-y-2", stories }
    })
}

#[inline_props]
fn StoryListing<'a>(cx: Scope<'a>, story: &'a StoryItem) -> Element {
    let StoryItem {
        id,
        title,
        url,
        by,
        score,
        time,
        kids,
        ..
    } = story;

    let url = url.as_deref().unwrap_or_default();
    let hostname = web_sys::Url::new(url)
        .map(|url| {
            let mut hostname = url.hostname();
            if hostname.starts_with("www.") {
                hostname = hostname[4..].to_string();
            }
            hostname
        })
        .ok()
        .unwrap_or_default();

    cx.render(rsx! {
        li { class: "rounded border border-gray-300 p-1",
            div {
                Link { to: "{url}", external: true, class: "font-semibold", "{title}" },
                match hostname.as_str() {
                    "" => rsx!{ "" },
                    name => rsx!{ span { class: "text-gray-600 text-sm", " ({name})" } },
                }
            }
            div { class: "text-sm text-gray-600",
                span { [format_args!("{score} {}", if *score == 1 { " point" } else { " points" })] }
                " by " Link { to: "user/{by}", "{by}" }
                " | " span { [format_args!("{}", time.format("%D %l:%M %p"))] } " | "
                span {
                    Link { to: "item/{id}",
                        [format_args!("{} {}", kids.len(), if kids.len() == 1 { " comment" } else { " comments" })]
                    }
                }
            }
        }
    })
}

#[inline_props]
fn StorySubmission(cx: Scope) -> Element {
    let item_id = use_route(&cx).segment::<i64>("id")?.ok()?;

    let item = use_future(&cx, || api::get_story(item_id));

    let story = match item.value() {
        Some(Ok(a)) => a,
        Some(Err(e)) => return cx.render(rsx! { "An error occured" }),
        None => return cx.render(rsx! { "Loading items" }),
    };

    let StoryItem {
        id,
        title,
        url,
        by,
        score,
        time,
        kids,
        ..
    } = &story.item;

    let hostname = web_sys::Url::new(url.as_deref().unwrap_or_default())
        .map(|url| {
            let mut hostname = url.hostname();
            if hostname.starts_with("www.") {
                hostname = hostname[4..].to_string();
            }
            hostname
        })
        .ok();

    // TODO: user view in app
    let by_url = format!("user/{}", by);
    let kids_url = format!("item/{}", id);
    let kids_len = kids.len();

    cx.render(rsx! {
        ul { class: "list-none mb-2"

        }
        ul { class: "list-none",
            match story.comments.is_empty() {
                true => rsx!( "No Comments Yet" ),
                false => rsx!( story.comments.iter().map(|comment| rsx!( Comment { comment: comment }) ) ),
            }
        }
    })
}

#[inline_props]
fn Comment<'a>(cx: Scope<'a>, comment: &'a Comment) -> Element {
    let Comment {
        by,
        text,
        time,
        sub_comments,
        ..
    } = comment;

    cx.render(rsx! {
        li { class: "mt-2",
            div { class: "mb-2 text-gray-600 border-t border-gray-300",
                Link { to: "user/{by}", class: "font-semibold", "{by}" },
                " | " span { [format_args!("{}", time.format("%D %l:%M %p"))] }
            }
            p { dangerous_inner_html: "{text}" }
            ul { class: "list-none ml-5",
                sub_comments.iter().map(|comment| rsx!(Comment { comment: comment }))
            }
        }
    })
}
