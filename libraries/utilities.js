function mouseOnEdge(tol) {
	const tolerance = tol ? tol : 10;
	return mouseX <= tolerance || mouseY <= tolerance ||
				mouseX >= width - tolerance || mouseY >= height - tolerance;
}
